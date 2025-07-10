import {
  GraphQLInterfaceType,
  GraphQLObjectType,
  Kind,
  TypeInfo,
  visit,
  visitWithTypeInfo,
  type DocumentNode,
  type FieldNode,
  type FragmentDefinitionNode,
  type FragmentSpreadNode,
  type InlineFragmentNode,
  type InterfaceTypeDefinitionNode,
  type ObjectTypeDefinitionNode,
  type OperationDefinitionNode,
  type SelectionSetNode,
  type TypeNode,
  type UnionTypeDefinitionNode,
} from 'graphql';
import z, { type ZodDiscriminatedUnionOption } from 'zod';
import type { SchemaValidator } from './SchemaValidator';

export class OperationValidator {
  private typeInfo: TypeInfo;
  private operationDefinitions: {
    definition: OperationDefinitionNode;
    astNode: ObjectTypeDefinitionNode;
  }[] = [];
  private fragments: Record<
    string,
    {
      definition: FragmentDefinitionNode;
      astNode: ObjectTypeDefinitionNode | InterfaceTypeDefinitionNode;
    }
  > = {};

  constructor(
    private operation: DocumentNode,
    private schemaValidator: SchemaValidator,
  ) {
    this.typeInfo = new TypeInfo(schemaValidator.builtSchema);
  }

  /**
   * Get the Zod validator for the operation.
   * @returns The Zod validator for the operation.
   */
  getValidator() {
    visit(
      this.operation,
      visitWithTypeInfo(this.typeInfo, {
        OperationDefinition: (node) => {
          const typeInfo = this.typeInfo.getType();
          if (typeInfo instanceof GraphQLObjectType && typeInfo.astNode) {
            this.operationDefinitions.push({
              definition: node,
              astNode: typeInfo.astNode,
            });
          }
        },
        FragmentDefinition: (definition) => {
          const typeInfo = this.typeInfo.getType();
          if (
            (typeInfo instanceof GraphQLObjectType ||
              typeInfo instanceof GraphQLInterfaceType) &&
            typeInfo.astNode
          ) {
            this.fragments[definition.name.value] = {
              definition,
              astNode: typeInfo.astNode,
            };
          }
        },
      }),
    );

    if (this.operationDefinitions.length > 1) {
      throw new Error('Multiple operation definitions are not supported');
    }

    const data = this.handleSelectionSet(
      this.operationDefinitions[0].definition.selectionSet,
      this.operationDefinitions[0].astNode,
    );

    return z.object({ data });
  }

  /**
   * Handle generating the Zod type for a GraphQL selection set.
   * @param {SelectionSetNode} selectionSet - The selection set.
   * @param {InterfaceTypeDefinitionNode | ObjectTypeDefinitionNode | UnionTypeDefinitionNode} parentNode - The parent type that selections are being made from.
   * @returns The Zod type for the selection set.
   */
  private handleSelectionSet(
    selectionSet: SelectionSetNode,
    parentNode:
      | InterfaceTypeDefinitionNode
      | ObjectTypeDefinitionNode
      | UnionTypeDefinitionNode,
  ):
    | z.ZodDiscriminatedUnion<
        '__typename',
        [
          ZodDiscriminatedUnionOption<'__typename'>,
          ...ZodDiscriminatedUnionOption<'__typename'>[],
        ]
      >
    | z.ZodObject<{
        [key: string]: any;
      }> {
    switch (parentNode.kind) {
      case Kind.INTERFACE_TYPE_DEFINITION:
        return this.handleInterfaceSelections(selectionSet, parentNode);
      case Kind.OBJECT_TYPE_DEFINITION:
        return this.handleObjectTypeSelections(selectionSet, parentNode);
      case Kind.UNION_TYPE_DEFINITION:
        return this.handleUnionSelections(selectionSet, parentNode);
    }
  }

  /**
   * Handle selections from a GraphQL Interface.
   * @param {SelectionSetNode} selectionSet - The selection set for the interface.
   * @param {InterfaceTypeDefinitionNode} parentNode - The Interface the selections are being made from.
   * @returns The Zod type for the interface selections.
   */
  private handleInterfaceSelections(
    selectionSet: SelectionSetNode,
    parentNode: InterfaceTypeDefinitionNode,
  ):
    | z.ZodDiscriminatedUnion<
        '__typename',
        [
          ZodDiscriminatedUnionOption<'__typename'>,
          ...ZodDiscriminatedUnionOption<'__typename'>[],
        ]
      >
    | z.ZodObject<{
        [key: string]: any;
      }> {
    const selectedFields: FieldNode[] = [];
    const inlineFragments: InlineFragmentNode[] = [];
    const namedFragments: FragmentSpreadNode[] = [];

    selectionSet.selections.forEach((selection) => {
      switch (selection.kind) {
        case Kind.FIELD:
          selectedFields.push(selection);
          break;
        case Kind.INLINE_FRAGMENT:
          inlineFragments.push(selection);
          break;
        case Kind.FRAGMENT_SPREAD:
          namedFragments.push(selection);
          break;
      }
    });

    const fieldResults: Record<string, any> = {};

    selectedFields.forEach((selection) => {
      if (selection.name.value === '__typename') {
        // If we reached a typename field, define it as a union of
        // all the GraphQL union's members.
        fieldResults.__typename = z.enum([
          parentNode.name.value,
          ...Object.values(this.schemaValidator.objectTypes)
            .filter((obj) =>
              obj.interfaces?.some(
                (i) => i.name.value === parentNode.name.value,
              ),
            )
            .map((obj) => obj.name.value),
        ] as unknown as readonly [string, ...string[]]);
        return;
      }

      // If its any other field than __typename, handle it as a
      // normal field.
      fieldResults[selection.name.value] = this.handleFieldSelection(
        selection,
        parentNode,
      );
    });

    let namedFragmentResults: any = z.object({});

    // Handle named fragments
    if (namedFragments.length > 0) {
      namedFragments.forEach((fragment) => {
        const fragmentDefinition = this.fragments[fragment.name.value];
        if (fragmentDefinition) {
          const loopResult = this.handleSelectionSet(
            fragmentDefinition.definition.selectionSet,
            fragmentDefinition.astNode,
          );
          if (loopResult instanceof z.ZodObject) {
            namedFragmentResults = z.object({
              ...namedFragmentResults.shape,
              ...loopResult.shape,
            });
          }
        }
      });
    }

    const fragmentResults: ZodDiscriminatedUnionOption<'__typename'>[] = [];

    // Process any inline fragments
    inlineFragments.forEach((fragment) => {
      if (!fragment.typeCondition) {
        return;
      }
      const fragmentTypeNode =
        this.schemaValidator.objectTypes[fragment.typeCondition.name.value];

      const fragmentObject = z
        // Add the typename
        .object({
          __typename: this.handleTypenameSelection(fragmentTypeNode),
        })
        // Add any interface fields
        .merge(z.object(fieldResults))
        // Add the object type fragment fields
        .merge(
          this.handleObjectTypeSelections(
            fragment.selectionSet,
            fragmentTypeNode,
          ) as ZodDiscriminatedUnionOption<'__typename'>,
        );

      fragmentResults.push(fragmentObject);
    });

    // If there are inline fragments, return a union of the distinct
    // member shapes.
    if (fragmentResults.length > 0) {
      return z.discriminatedUnion(
        '__typename',
        fragmentResults as [
          ZodDiscriminatedUnionOption<'__typename'>,
          ...ZodDiscriminatedUnionOption<'__typename'>[],
        ],
      );
    }

    return namedFragmentResults.merge(z.object(fieldResults));
  }

  /**
   * Handle selections from a GraphQL Object Type or Interface.
   * @param {SelectionSetNode} selectionSet - The object's selections.
   * @param {ObjectTypeDefinitionNode | InterfaceTypeDefinitionNode} parentNode - The object selections are being made from.
   * @returns The Zod type for the object.
   */
  private handleObjectTypeSelections(
    selectionSet: SelectionSetNode,
    parentNode: ObjectTypeDefinitionNode | InterfaceTypeDefinitionNode,
  ): z.ZodObject<{
    [key: string]: any;
  }> {
    const result: Record<string, any> = {};
    const inlineFragments: InlineFragmentNode[] = [];
    const namedFragments: FragmentSpreadNode[] = [];

    selectionSet.selections.forEach((selection) => {
      switch (selection.kind) {
        case Kind.FIELD:
          if (selection.name.value === '__typename') {
            result.__typename = this.handleTypenameSelection(parentNode, true);
            return;
          }
          result[selection.name.value] = this.handleFieldSelection(
            selection,
            parentNode,
          );
          break;
        case Kind.INLINE_FRAGMENT:
          inlineFragments.push(selection);
          break;
        case Kind.FRAGMENT_SPREAD:
          namedFragments.push(selection);
          break;
      }
    });

    let namedFragmentResults: any = z.object({});

    if (namedFragments.length > 0) {
      namedFragments.forEach((fragment) => {
        const fragmentDefinition = this.fragments[fragment.name.value];
        if (fragmentDefinition) {
          const loopResult = this.handleSelectionSet(
            fragmentDefinition.definition.selectionSet,
            fragmentDefinition.astNode,
          );

          if (loopResult instanceof z.ZodObject) {
            namedFragmentResults = z.object({
              ...namedFragmentResults.shape,
              ...loopResult.shape,
            });
          }
        }
      });
    }
    return z.object({ ...result, ...namedFragmentResults.shape });
  }

  /**
   * Handle selections from a GraphQL Union.
   * @param {SelectionSetNode} selectionSet - The union's selections.
   * @param {UnionTypeDefinitionNode} parentNode - The union selections are being made from.
   * @returns The Zod type for the union.
   */
  private handleUnionSelections(
    selectionSet: SelectionSetNode,
    parentNode: UnionTypeDefinitionNode,
  ):
    | z.ZodDiscriminatedUnion<
        '__typename',
        [
          ZodDiscriminatedUnionOption<'__typename'>,
          ...ZodDiscriminatedUnionOption<'__typename'>[],
        ]
      >
    | z.ZodObject<{ [key: string]: any }> {
    const selectedFields: FieldNode[] = [];
    const inlineFragments: InlineFragmentNode[] = [];
    const namedFragments: FragmentSpreadNode[] = [];

    selectionSet.selections.forEach((selection) => {
      switch (selection.kind) {
        case Kind.FIELD:
          selectedFields.push(selection);
          break;
        case Kind.INLINE_FRAGMENT:
          inlineFragments.push(selection);
          break;
        case Kind.FRAGMENT_SPREAD:
          namedFragments.push(selection);
          break;
      }
    });

    const fieldResults: Record<string, any> = {};

    selectedFields.forEach((selection) => {
      if (selection.name.value === '__typename') {
        // If we reached a typename field, define it as a union of
        // all the GraphQL union's members.
        fieldResults.__typename = z.enum([
          ...(parentNode.types || []).map((member) => member.name.value),
        ] as unknown as readonly [string, ...string[]]);
        return;
      }
    });

    const fragmentResults: ZodDiscriminatedUnionOption<'__typename'>[] = [];

    // Process any inline fragments
    inlineFragments.forEach((fragment) => {
      if (!fragment.typeCondition) {
        return;
      }
      const fragmentTypeNode =
        this.schemaValidator.objectTypes[fragment.typeCondition.name.value] ||
        this.schemaValidator.interfaces[fragment.typeCondition.name.value];

      const fragmentObject = z
        .object({
          __typename: z.literal(fragmentTypeNode.name.value),
        })
        .merge(
          this.handleObjectTypeSelections(
            fragment.selectionSet,
            fragmentTypeNode,
          ) as ZodDiscriminatedUnionOption<'__typename'>,
        );

      fragmentResults.push(fragmentObject);
    });

    // If there are inline fragments, return a union of the distinct
    // member shapes.
    if (fragmentResults.length > 0) {
      return z.discriminatedUnion(
        '__typename',
        fragmentResults as [
          ZodDiscriminatedUnionOption<'__typename'>,
          ...ZodDiscriminatedUnionOption<'__typename'>[],
        ],
      );
    }

    // If there are no fragments, return the fields from the union
    // (which should just be __typename)
    return z.object(fieldResults);
  }

  /**
   * Handle the __typename field.
   * @param {ObjectTypeDefinitionNode | InterfaceTypeDefinitionNode} parentNode - The object the __typename belongs to.
   * @returns The Zod type for the __typename field.
   */
  private handleTypenameSelection(
    parentNode: ObjectTypeDefinitionNode | InterfaceTypeDefinitionNode,
    coerce = false,
  ):
    | z.ZodLiteral<string>
    | z.ZodEffects<z.ZodLiteral<string>, string, unknown> {
    const typename = z.literal(parentNode.name.value);
    if (!coerce) {
      return typename;
    }
    return z.preprocess(() => parentNode.name.value, typename);
  }

  /**
   * Handle a field selection.
   * @param {FieldNode} selection - The selection info for the field.
   * @param {ObjectTypeDefinitionNode | InterfaceTypeDefinitionNode} parentNode - The object the field belongs to.
   * @returns The Zod type for the field.
   */
  private handleFieldSelection(
    selection: FieldNode,
    parentNode: ObjectTypeDefinitionNode | InterfaceTypeDefinitionNode,
  ) {
    const fieldNode = parentNode.fields?.find(
      (field) => field.name.value === selection.name.value,
    );

    if (!fieldNode) {
      return z.null();
    }

    return this.handleFieldType(fieldNode.type, selection);
  }

  /**
   * Handle the creation of the Zod type for a GraphQL field's type.
   * @param {TypeNode} nodeType - The current level of the field's type being inspected.
   *                              This may be levels deep if the field returns a list, non-null, etc.
   * @param {FieldNode} selection - The selection being examined.
   * @param {boolean} nullable - Whether or not the type is nullable
   * @returns The Zod type for the field's type at the current level being examined.
   */
  private handleFieldType(
    nodeType: TypeNode,
    selection: FieldNode,
    nullable = true,
  ):
    | z.ZodArray<any, any>
    | z.ZodNullable<z.ZodArray<any, any>>
    | z.ZodEnum<any>
    | z.ZodNullable<z.ZodEnum<any>>
    | z.ZodDiscriminatedUnion<
        '__typename',
        [
          ZodDiscriminatedUnionOption<'__typename'>,
          ...ZodDiscriminatedUnionOption<'__typename'>[],
        ]
      >
    | z.ZodNullable<
        z.ZodDiscriminatedUnion<
          '__typename',
          [
            ZodDiscriminatedUnionOption<'__typename'>,
            ...ZodDiscriminatedUnionOption<'__typename'>[],
          ]
        >
      >
    | z.ZodObject<{
        [key: string]: any;
      }>
    | z.ZodNullable<
        z.ZodObject<{
          [key: string]: any;
        }>
      > {
    let result:
      | z.ZodArray<any, any>
      | z.ZodNullable<z.ZodArray<any, any>>
      | z.ZodEnum<any>
      | z.ZodNullable<z.ZodEnum<any>>
      | z.ZodDiscriminatedUnion<
          '__typename',
          [
            ZodDiscriminatedUnionOption<'__typename'>,
            ...ZodDiscriminatedUnionOption<'__typename'>[],
          ]
        >
      | z.ZodNullable<
          z.ZodDiscriminatedUnion<
            '__typename',
            [
              ZodDiscriminatedUnionOption<'__typename'>,
              ...ZodDiscriminatedUnionOption<'__typename'>[],
            ]
          >
        >
      | z.ZodObject<{
          [key: string]: any;
        }>
      | z.ZodNullable<
          z.ZodObject<{
            [key: string]: any;
          }>
        > = z.unknown() as any;
    let returnTypeName: string;

    switch (nodeType.kind) {
      case Kind.NON_NULL_TYPE:
        return this.handleFieldType(nodeType.type, selection, false);
      case Kind.LIST_TYPE:
        result = z.array(this.handleFieldType(nodeType.type, selection));
        break;
      case Kind.NAMED_TYPE:
        returnTypeName = nodeType.name.value;
        if (this.schemaValidator.scalars[returnTypeName]) {
          result = this.schemaValidator.scalars[returnTypeName];
        } else if (this.schemaValidator.enums[returnTypeName]) {
          result = z.enum([
            ...this.schemaValidator.enums[returnTypeName],
          ] as unknown as readonly [string, ...string[]]);
        } else if (selection.selectionSet) {
          if (this.schemaValidator.interfaces[returnTypeName]) {
            result = this.handleSelectionSet(
              selection.selectionSet,
              this.schemaValidator.interfaces[returnTypeName],
            );
          } else if (this.schemaValidator.objectTypes[returnTypeName]) {
            result = this.handleSelectionSet(
              selection.selectionSet,
              this.schemaValidator.objectTypes[returnTypeName],
            );
          } else if (this.schemaValidator.unions[returnTypeName]) {
            result = this.handleSelectionSet(
              selection.selectionSet,
              this.schemaValidator.unions[returnTypeName],
            );
          }
        }
    }

    if (nullable) {
      // Typing this function is a pain,
      // It will need to be sorted out...
      result = z.nullable(result) as any;
    }

    return result;
  }
}
