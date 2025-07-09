import {
  createGoogleGenerativeAI,
  type GoogleGenerativeAIProvider,
} from '@ai-sdk/google';
import type { Operation } from '@apollo/client';
import { type LanguageModelV1, generateObject } from 'ai';
import { print } from 'graphql';
import { objectToString, type GenericObject } from '../utils';
import schema from '../supergraph.graphql';
import { SchemaValidator } from './validation/SchemaValidator';

export type AIModelOptions = {
  modelId?: string;
  systemPrompt?: string;
  schemaFile?: string;
};

const DEFAULT_MODEL_ID = 'gemini-2.0-flash';
const BASE_SYSTEM_PROMPT = ``;

export class AIModel {
  private provider: GoogleGenerativeAIProvider;
  private model: LanguageModelV1;
  private systemPrompt: string | undefined;
  private schemaValidator: SchemaValidator;

  constructor({ modelId, systemPrompt }: AIModelOptions) {
    this.systemPrompt = systemPrompt || '';
    this.provider = createGoogleGenerativeAI({
      apiKey: import.meta.env.VITE_AI_API_KEY,
    });
    this.model = this.provider(modelId || DEFAULT_MODEL_ID);
    this.systemPrompt = (systemPrompt || '') + BASE_SYSTEM_PROMPT;
    this.schemaValidator = new SchemaValidator(schema);
  }

  generateResponseForOperation(operation: Operation): Promise<GenericObject> {
    const validator = this.schemaValidator.getOperationValidator(
      operation.query,
    );

    return generateObject({
      model: this.model,
      ...(this.systemPrompt ? { system: this.systemPrompt } : {}),
      prompt: AIModel.createPrompt(operation),
      mode: 'json',
      schema: validator,
      // output: 'no-schema',
    }).then(({ object: result, finishReason, usage, warnings }) => {
      console.log('generateObject result:', result);
      console.log('finishReason:', finishReason);
      console.log('usage:', usage);
      console.log('warnings:', warnings);
      if (!result || typeof result !== 'object') {
        return { data: null };
      }
      return result;
    });
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

    const prompt = `Give me mock data that fulfills this query:
    \`\`\`graphql
    ${queryString}
    \`\`\`${promptVariables}`;

    console.log('prompt:', prompt);

    return prompt;
  }
}
