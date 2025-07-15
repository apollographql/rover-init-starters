import {
  createGoogleGenerativeAI,
  type GoogleGenerativeAIProvider,
} from '@ai-sdk/google';
import type { Operation } from '@apollo/client';
import { type LanguageModelV1, type Schema, generateObject } from 'ai';
import { print } from 'graphql';
import { objectToString, type GenericObject } from './utils';
import { SchemaValidator } from './validation/SchemaValidator';
import type z from 'zod';

export type AIModelOptions = {
  modelId?: string;
  systemPrompt?: string;
  schemaFile?: string;
};

const DEFAULT_MODEL_ID = 'gemini-2.0-flash';
const DEFAULT_SCHEMA_FILE = '../supergraph.graphql';
const BASE_SYSTEM_PROMPT = `
You are returning mock data for a GraphQL API.

When generating image URLs, use these reliable placeholder services with unique identifiers:
- https://picsum.photos/[width]/[height]?random=[unique_identifier] (e.g., https://picsum.photos/400/300?random=asdf, ?random=ytal, etc.)
- https://via.placeholder.com/[width]x[height]/[color]/[text_color]?text=[context] (e.g., ?text=Product+asdf)
- https://placehold.co/[width]x[height]/[color]/[text_color]?text=[context] (e.g, ?text=User+Avatar)
For list items, increment the random number or use contextual text to ensure unique images.
Avoid using numbers for unique identifiers. Unique identifier and typename combinations should result in consistent data.
For example, say something is named "Foobar", you should use a unique identifier like "foobar" and not a number.
Remember context and data based on the unique identifier and typename so that data is consistent.
`;

type RequiredGenerateObjectOptions = {
  model: LanguageModelV1;
  mode: 'json';
  prompt: string;
  system?: string;
};

type GenerateObjectWithoutSchemaOptions = {
  output: 'no-schema';
} & RequiredGenerateObjectOptions;

type GenerateObjectWithSchemaOptions = {
  schema: z.Schema<any, z.ZodTypeDef, any> | Schema<any>;
} & RequiredGenerateObjectOptions;

export class AIModel {
  private provider: GoogleGenerativeAIProvider;
  private model: LanguageModelV1;
  private systemPrompt: string | undefined;
  private schema: string | boolean | undefined;
  private schemaValidator: SchemaValidator | undefined;
  private schemaFile: string;

  constructor({ modelId, systemPrompt, schemaFile }: AIModelOptions) {
    this.systemPrompt = systemPrompt || '';
    this.provider = createGoogleGenerativeAI({
      apiKey: import.meta.env.AI_API_KEY,
    });
    this.model = this.provider(modelId || DEFAULT_MODEL_ID);
    this.systemPrompt = (systemPrompt || '') + BASE_SYSTEM_PROMPT;
    this.schemaFile = schemaFile || DEFAULT_SCHEMA_FILE;
  }

  private async loadSchema(): Promise<string | false> {
    try {
      // Use dynamic import with the configurable schema file path
      const module = await import(/* @vite-ignore */ this.schemaFile);
      console.log('Schema loaded from:', this.schemaFile);
      return module.default;
    } catch {
      // It's totally fine if the schema is not available.
      // We can mock without a schema file.
      return false;
    }
  }

  async generateResponseForOperation(
    operation: Operation,
  ): Promise<GenericObject> {
    console.log('\n###########');
    console.log('Generating response for operation');

    if (!this.schemaValidator && this.schema === undefined) {
      const loadedSchema = await this.loadSchema();
      this.schema = loadedSchema;

      if (typeof this.schema === 'object' && this.schema) {
        this.schemaValidator = new SchemaValidator(this.schema);
      }
    }

    let validator: any | undefined;

    if (this.schemaValidator) {
      console.log('Creating schema validator');
      validator = this.schemaValidator.getOperationValidator(operation.query);
    }

    const promptOptions: RequiredGenerateObjectOptions = {
      model: this.model,
      prompt: AIModel.createPrompt(operation),
      mode: 'json',
    };

    if (this.systemPrompt) {
      promptOptions.system = this.systemPrompt;
    }

    if (validator) {
      console.log('Using schema validator');
      (promptOptions as GenerateObjectWithSchemaOptions).schema = validator;
    } else {
      (promptOptions as GenerateObjectWithoutSchemaOptions).output =
        'no-schema';
    }

    console.log('Generating object from prompt:', promptOptions.prompt);
    return generateObject(promptOptions as any).then(
      ({ object: result, finishReason, usage, warnings }) => {
        console.log('prompt result:', result);
        console.log('finishReason:', finishReason);
        console.log('usage:', usage);
        console.log('warnings:', warnings);
        if (!result || typeof result !== 'object') {
          return { data: null };
        }
        if (!Object.prototype.hasOwnProperty.call(result, 'data')) {
          return { data: result } as GenericObject;
        }
        return result;
      },
    );
  }

  static createPrompt({ query, variables }: Operation): string {
    const queryString = print(query);

    let promptVariables = '';
    if (variables) {
      promptVariables = `

    With variables:
    \`\`\`json
    ${objectToString(variables)}
    \`\`\``;
    }

    const consistencyNote = variables ? `
    
    IMPORTANT: Be consistent with the provided variables. If an ID is provided, use it to generate consistent, deterministic data. For example, if id="1", always generate the same location data for that ID. Use the ID as a seed for consistent generation.` : '';

    const prompt = `Give me mock data that fulfills this query:
    \`\`\`graphql
    ${queryString}
    \`\`\`${promptVariables}${consistencyNote}`;

    return prompt;
  }
}
