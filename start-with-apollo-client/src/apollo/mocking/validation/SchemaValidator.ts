import {
  buildASTSchema,
  Kind,
  parse,
  visit,
  GraphQLSchema,
  type DocumentNode,
  type EnumTypeDefinitionNode,
  type EnumTypeExtensionNode,
  type FieldDefinitionNode,
  type InterfaceTypeDefinitionNode,
  type InterfaceTypeExtensionNode,
  type NamedTypeNode,
  type ObjectTypeDefinitionNode,
  type ObjectTypeExtensionNode,
  type UnionTypeDefinitionNode,
  type UnionTypeExtensionNode,
} from 'graphql';
import { z } from 'zod';
import { type DefaultScalars, defaultScalars } from './defaultScalars';
import { OperationValidator } from './OperationValidator';

export class SchemaValidator {
  private ast: DocumentNode;
  public builtSchema: GraphQLSchema;

  public enums: Record<string, string[]> = {};
  public interfaces: Record<string, InterfaceTypeDefinitionNode> = {};
  public interfaceExts: InterfaceTypeExtensionNode[] = [];
  public objectTypes: Record<string, ObjectTypeDefinitionNode> = {};
  public objectTypeExts: ObjectTypeExtensionNode[] = [];
  public scalars: DefaultScalars & Record<string, any>;
  public unions: Record<string, UnionTypeDefinitionNode> = {};
  public unionExts: UnionTypeExtensionNode[] = [];

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
    const operationValidator = new OperationValidator(operation, this);
    return operationValidator.getValidator();
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
