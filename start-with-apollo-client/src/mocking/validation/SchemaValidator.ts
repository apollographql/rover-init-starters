import {
  buildASTSchema,
  Kind,
  parse,
  visit,
  visitWithTypeInfo,
  TypeInfo,
  GraphQLSchema,
  GraphQLObjectType,
  type DocumentNode,
  type EnumTypeDefinitionNode,
  type EnumTypeExtensionNode,
  type FieldDefinitionNode,
  type InterfaceTypeDefinitionNode,
  type InterfaceTypeExtensionNode,
  type NamedTypeNode,
  type ObjectTypeDefinitionNode,
  type ObjectTypeExtensionNode,
  type TypeNode,
  type UnionTypeDefinitionNode,
  type UnionTypeExtensionNode,
  type SelectionSetNode,
  type FieldNode,
  type InlineFragmentNode,
  type FragmentSpreadNode,
} from 'graphql';
import { type ZodDiscriminatedUnionOption, z } from 'zod';
import { type DefaultScalars, defaultScalars } from './defaultScalars';

export class SchemaValidator {
  private ast: DocumentNode;
  private builtSchema: GraphQLSchema;

  private enums: Record<string, string[]> = {};
  private interfaces: Record<string, InterfaceTypeDefinitionNode> = {};
  private interfaceExts: InterfaceTypeExtensionNode[] = [];
  private objectTypes: Record<string, ObjectTypeDefinitionNode> = {};
  private objectTypeExts: ObjectTypeExtensionNode[] = [];
  private scalars: DefaultScalars & Record<string, any>;
  private unions: Record<string, UnionTypeDefinitionNode> = {};
  private unionExts: UnionTypeExtensionNode[] = [];

  constructor(schema: string | DocumentNode) {
    this.ast =
      typeof schema === 'string' ? parse(schema, { noLocation: true }) : schema;
    this.builtSchema = buildASTSchema(this.ast);

    this.scalars = {
      ...defaultScalars,
    };

    visit(this.ast, {
      // We can collect the final shapes of scalars and enums right away
      // because they don't have any dependencies on other nodes
      ScalarTypeDefinition: (node) => {
        this.setScalar(node.name.value);
      },
      ScalarTypeExtension: (node) => {
        this.setScalar(node.name.value);
      },
      // We collect node types that are dependent on other nodes individually
      // so we can do things with them later. We have to create these
      // references in multiple steps because there is no guarantee
      // that any one node kind will be completely handled before
      // another node kind is handled or that the node won't have both
      // a definition and extension with slightly differing children/attributes.
      EnumTypeDefinition: (node) => {
        this.setEnum(node);
      },
      EnumTypeExtension: (node) => {
        this.setEnum(node);
      },
      InterfaceTypeDefinition: (node) => {
        this.interfaces[node.name.value] = node;
      },
      InterfaceTypeExtension: (node) => {
        this.interfaceExts.push(node);
      },
      ObjectTypeDefinition: (node) => {
        this.objectTypes[node.name.value] = node;
      },
      ObjectTypeExtension: (node) => {
        this.objectTypeExts.push(node);
      },
      UnionTypeDefinition: (node) => {
        this.unions[node.name.value] = node;
      },
      UnionTypeExtension: (node) => {
        this.unionExts.push(node);
      },
    });

    // Merge extensions onto definitions to ensure there's only a single
    // occurrence of a node
    SchemaValidator.mergeObjectDefsAndExts(
      this.objectTypes,
      this.objectTypeExts,
    );
    SchemaValidator.mergeObjectDefsAndExts(this.interfaces, this.interfaceExts);
    SchemaValidator.mergeUnionDefsAndExts(this.unions, this.unionExts);
  }

  /**
   * Get a validator tailored to a given GraphQL operation.
   * @param {string} operation - The GraphQL operation.
   * @returns A Zod schema tailored to the operation.
   */
  public getOperationValidator(operation: DocumentNode): any {
    const typeInfo = new TypeInfo(this.builtSchema);

    let data: any = {};

    visit(
      operation,
      visitWithTypeInfo(typeInfo, {
        OperationDefinition: (node) => {
          const type = typeInfo.getType();
          if (type instanceof GraphQLObjectType && type.astNode) {
            data = this.handleSelectionSet(node.selectionSet, type.astNode);
          }
        },
      }),
    );

    return z.object({ data });
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
        if (this.scalars[returnTypeName]) {
          result = this.scalars[returnTypeName];
        } else if (this.enums[returnTypeName]) {
          result = z.enum([
            ...this.enums[returnTypeName],
          ] as unknown as readonly [string, ...string[]]);
        } else if (selection.selectionSet) {
          if (this.interfaces[returnTypeName]) {
            result = this.handleSelectionSet(
              selection.selectionSet,
              this.interfaces[returnTypeName],
            );
          } else if (this.objectTypes[returnTypeName]) {
            result = this.handleSelectionSet(
              selection.selectionSet,
              this.objectTypes[returnTypeName],
            );
          } else if (this.unions[returnTypeName]) {
            result = this.handleSelectionSet(
              selection.selectionSet,
              this.unions[returnTypeName],
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
          ...Object.values(this.objectTypes)
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

    const fragmentResults: ZodDiscriminatedUnionOption<'__typename'>[] = [];

    // Process any inline fragments
    inlineFragments.forEach((fragment) => {
      if (!fragment.typeCondition) {
        return;
      }
      const fragmentTypeNode =
        this.objectTypes[fragment.typeCondition.name.value];

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

    return z.object(fieldResults);
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

    selectionSet.selections.forEach((selection) => {
      if (selection.kind === Kind.FIELD) {
        if (selection.name.value === '__typename') {
          result.__typename = this.handleTypenameSelection(parentNode, true);
          return;
        }

        result[selection.name.value] = this.handleFieldSelection(
          selection,
          parentNode,
        );
      }
    });

    return z.object(result);
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
        this.objectTypes[fragment.typeCondition.name.value] ||
        this.interfaces[fragment.typeCondition.name.value];

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
   * Add an enum to the collected list of enums present in the subgraph schema.
   * @param {EnumTypeDefinitionNode | EnumTypeExtensionNode} node - The enum node.
   */
  private setEnum(node: EnumTypeDefinitionNode | EnumTypeExtensionNode): void {
    if (!node.values?.length) {
      return;
    }
    if (!this.enums[node.name.value]) {
      this.enums[node.name.value] = [];
    }
    this.enums[node.name.value].push(
      ...node.values.map((val) => val.name.value),
    );
  }

  /**
   * Add a scalar to the collected list of scalars present in the subgraph schema.
   * @param {string} name - The scalar name.
   */
  private setScalar(name: string): void {
    switch (name) {
      case 'DateTime':
        this.scalars[name] = z.coerce.string().datetime();
        break;
      case 'LocalTime':
        this.scalars[name] = z.coerce.string().time();
        break;
      case 'Url':
        this.scalars[name] = z.coerce.string().url();
        break;
      default:
        this.scalars[name] = defaultScalars.String;
        break;
    }
  }

  /**
   * Merge the interfaces applied to an object type and its extensions, eliminating duplicates.
   * @param {ReadonlyArray<NamedTypeNode>} interfacesA
   * @param {ReadonlyArray<NamedTypeNode>} interfacesB
   * @returns {ReadonlyArray<NamedTypeNode>} The merged interfaces.
   */
  private static mergeInterfaces(
    interfacesA: ReadonlyArray<NamedTypeNode> | undefined,
    interfacesB: ReadonlyArray<NamedTypeNode> | undefined,
  ): ReadonlyArray<NamedTypeNode> {
    return [
      ...(interfacesA || []),
      ...(interfacesB || []).filter((ib) =>
        (interfacesA || []).every((ia) => ia.name.value !== ib.name.value),
      ),
    ];
  }

  /**
   * Merge the child fields of an Object and its extensions into a single list of fields, eliminating duplicates.
   * @param {ReadonlyArray<FieldDefinitionNode> | undefined} fieldsA
   * @param {ReadonlyArray<FieldDefinitionNode> | undefined} fieldsB
   * @returns {ReadonlyArray<FieldDefinitionNode>} The merged fields.
   */
  private static mergeFields(
    fieldsA: ReadonlyArray<FieldDefinitionNode> | undefined,
    fieldsB: ReadonlyArray<FieldDefinitionNode> | undefined,
  ): ReadonlyArray<FieldDefinitionNode> {
    return [
      ...(fieldsA || []),
      ...(fieldsB || []).filter((b) =>
        (fieldsA || []).every((a) => a.name.value !== b.name.value),
      ),
    ];
  }

  /**
   * Merge the types (members) of a union definition and its extensions, eliminating duplicates.
   * @param {ReadonlyArray<NamedTypeNode> | undefined} typesA
   * @param {ReadonlyArray<NamedTypeNode> | undefined} typesB
   * @returns {ReadonlyArray<NamedTypeNode>} The merged union types.
   */
  private static mergeUnionTypes(
    typesA: ReadonlyArray<NamedTypeNode> | undefined,
    typesB: ReadonlyArray<NamedTypeNode> | undefined,
  ): ReadonlyArray<NamedTypeNode> {
    return [
      ...(typesA || []),
      ...(typesB || []).filter((b) =>
        (typesA || []).every((a) => a.name.value !== b.name.value),
      ),
    ];
  }

  /**
   * Merge object definitions and their extensions into a final list of solely object definitions.
   * @param {Record<string, ObjectTypeDefinitionNode> | Record<string, InterfaceTypeDefinitionNode>} defs - The object definitions.
   * @param {ObjectTypeExtensionNode[] | InterfaceTypeExtensionNode[]} exts - The object extensions.
   * @returns {{Record<string, ObjectTypeDefinitionNode> | Record<string, InterfaceTypeDefinitionNode>}} The final object definitions.
   */
  private static mergeObjectDefsAndExts<
    D extends
      | Record<string, ObjectTypeDefinitionNode>
      | Record<string, InterfaceTypeDefinitionNode>,
    E extends ObjectTypeExtensionNode[] | InterfaceTypeExtensionNode[],
  >(defs: D, exts: E): D {
    exts.forEach((ext) => {
      const def = defs[ext.name.value];
      let kind: string | undefined;

      switch (ext.kind) {
        case Kind.INTERFACE_TYPE_EXTENSION:
          kind = Kind.INTERFACE_TYPE_DEFINITION;
          break;
        case Kind.OBJECT_TYPE_EXTENSION:
          kind = Kind.OBJECT_TYPE_DEFINITION;
          break;
      }

      if (!def) {
        defs[ext.name.value] = {
          ...ext,
          kind,
        };
        return;
      }

      // We don't merge directives because, for type checking, we don't
      // care about directives
      defs[ext.name.value] = {
        ...def,
        interfaces: SchemaValidator.mergeInterfaces(
          def.interfaces,
          ext.interfaces,
        ),
        fields: SchemaValidator.mergeFields(def.fields, ext.fields),
      };
    });
    return defs;
  }

  /**
   * Merge union definitions and their extensions into a single list of union definitions.
   * @param {Record<string, UnionTypeDefinitionNode>} defs - The union definitions.
   * @param {UnionTypeExtensionNode[]} exts - The union extensions.
   * @returns {Record<string, UnionTypeDefinitionNode>} The merged union definitions.
   */
  private static mergeUnionDefsAndExts(
    defs: Record<string, UnionTypeDefinitionNode>,
    exts: UnionTypeExtensionNode[],
  ): Record<string, UnionTypeDefinitionNode> {
    exts.forEach((ext) => {
      const def = defs[ext.name.value];

      if (!def) {
        defs[ext.name.value] = {
          ...ext,
          kind: Kind.UNION_TYPE_DEFINITION,
        };
        return;
      }

      // We don't merge directives because, for type checking, we don't
      // care about directives
      defs[ext.name.value] = {
        ...def,
        types: SchemaValidator.mergeUnionTypes(def.types, ext.types),
      };
    });
    return defs;
  }
}
