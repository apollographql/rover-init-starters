import { invariant } from '@apollo/client/utilities/globals/index.js';
import { equal } from '@wry/equality';
import {
  ApolloLink,
  type Operation,
  type GraphQLRequest,
  type FetchResult,
} from '@apollo/client';
import {
  Observable,
  addTypenameToDocument,
  removeClientSetsFromDocument,
  cloneDeep,
  print,
  getOperationDefinition,
  getDefaultValues,
  removeDirectivesFromDocument,
  checkDocument,
  makeUniqueId,
} from '@apollo/client/utilities/index.js';
import type { Unmasked } from '@apollo/client/masking/index.js';
import { AIModel } from './AIModel';

/** @internal */
type CovariantUnaryFunction<out Arg, out Ret> = { fn(arg: Arg): Ret }['fn'];

export type ResultFunction<T, V = Record<string, any>> = CovariantUnaryFunction<
  V,
  T
>;

export type VariableMatcher<V = Record<string, any>> = CovariantUnaryFunction<
  V,
  boolean
>;

export interface MockedResponse<
  // eslint-disable-next-line
  // @ts-ignore
  out TData = Record<string, any>,
  out TVariables = Record<string, any>,
> {
  request: GraphQLRequest<TVariables>;
  maxUsageCount?: number;
  result?:
    | FetchResult<Unmasked<TData>>
    | ResultFunction<FetchResult<Unmasked<TData>>, TVariables>;
  error?: Error;
  delay?: number;
  variableMatcher?: VariableMatcher<TVariables>;
  newData?: ResultFunction<FetchResult<Unmasked<TData>>, TVariables>;
}

export interface MockLinkOptions {
  showWarnings?: boolean;
  systemPrompt?: string;
}

function requestToKey(request: GraphQLRequest, addTypename: boolean): string {
  const queryString =
    request.query &&
    print(addTypename ? addTypenameToDocument(request.query) : request.query);
  const requestKey = { query: queryString };
  return JSON.stringify(requestKey);
}

export class MockLink extends ApolloLink {
  public operation!: Operation;
  public addTypename: boolean = true;
  public showWarnings: boolean = true;
  private mockedResponsesByKey: { [key: string]: MockedResponse[] } = {};
  private aiModel: AIModel;

  constructor(
    mockedResponses: ReadonlyArray<MockedResponse<any, any>>,
    addTypename: boolean = true,
    options: MockLinkOptions = Object.create(null),
  ) {
    super();
    this.aiModel = new AIModel({ systemPrompt: options.systemPrompt });
    this.addTypename = addTypename;
    this.showWarnings = options.showWarnings ?? true;

    if (mockedResponses) {
      mockedResponses.forEach((mockedResponse) => {
        this.addMockedResponse(mockedResponse);
      });
    }
  }

  public addMockedResponse(mockedResponse: MockedResponse) {
    const normalizedMockedResponse =
      this.normalizeMockedResponse(mockedResponse);
    const key = requestToKey(
      normalizedMockedResponse.request,
      this.addTypename,
    );
    let mockedResponses = this.mockedResponsesByKey[key];
    if (!mockedResponses) {
      mockedResponses = [];
      this.mockedResponsesByKey[key] = mockedResponses;
    }
    mockedResponses.push(normalizedMockedResponse);
  }

  public request(operation: Operation): Observable<FetchResult> | null {
    this.operation = operation;
    const queryPrompt = operation.getContext().prompt;

    // Return an Observable for Apollo Client to subscribe to
    return new Observable((observer) => {
      try {
        // Generate a response for the operation using the AI model
        this.aiModel.generateResponseForOperation(operation, queryPrompt).then((result) => {
          // Notify the observer with the generated response
          observer.next(result);
        });
      } catch (error) {
        console.log(error);
      }
    });
  }

  private normalizeMockedResponse(
    mockedResponse: MockedResponse,
  ): MockedResponse {
    const newMockedResponse = cloneDeep(mockedResponse);
    const queryWithoutClientOnlyDirectives = removeDirectivesFromDocument(
      [{ name: 'connection' }, { name: 'nonreactive' }, { name: 'unmask' }],
      checkDocument(newMockedResponse.request.query),
    );
    invariant(queryWithoutClientOnlyDirectives, 'query is required');
    newMockedResponse.request.query = queryWithoutClientOnlyDirectives!;
    const query = removeClientSetsFromDocument(newMockedResponse.request.query);
    if (query) {
      newMockedResponse.request.query = query;
    }

    mockedResponse.maxUsageCount = mockedResponse.maxUsageCount ?? 1;
    invariant(
      mockedResponse.maxUsageCount > 0,
      `Mock response maxUsageCount must be greater than 0, %s given`,
      mockedResponse.maxUsageCount,
    );

    this.normalizeVariableMatching(newMockedResponse);
    return newMockedResponse;
  }

  private normalizeVariableMatching(mockedResponse: MockedResponse) {
    const request = mockedResponse.request;
    if (mockedResponse.variableMatcher && request.variables) {
      throw new Error(
        'Mocked response should contain either variableMatcher or request.variables',
      );
    }

    if (!mockedResponse.variableMatcher) {
      request.variables = {
        ...getDefaultValues(getOperationDefinition(request.query)),
        ...request.variables,
      };
      mockedResponse.variableMatcher = (vars) => {
        const requestVariables = vars || {};
        const mockedResponseVariables = request.variables || {};
        return equal(requestVariables, mockedResponseVariables);
      };
    }
  }
}

export interface MockApolloLink extends ApolloLink {
  operation?: Operation;
}

// Pass in multiple mocked responses, so that you can test flows that end up
// making multiple queries to the server.
// NOTE: The last arg can optionally be an `addTypename` arg.
export function mockSingleLink(...mockedResponses: Array<any>): MockApolloLink {
  // To pull off the potential typename. If this isn't a boolean, we'll just
  // set it true later.
  let maybeTypename = mockedResponses[mockedResponses.length - 1];
  let mocks = mockedResponses.slice(0, mockedResponses.length - 1);

  if (typeof maybeTypename !== 'boolean') {
    mocks = mockedResponses;
    maybeTypename = true;
  }

  return new MockLink(mocks, maybeTypename);
}

// This is similiar to the stringifyForDisplay utility we ship, but includes
// support for NaN in addition to undefined. More values may be handled in the
// future. This is not added to the primary stringifyForDisplay helper since it
// is used for the cache and other purposes. We need this for debuggging only.
export function stringifyForDebugging(value: any, space = 0): string {
  const undefId = makeUniqueId('undefined');
  const nanId = makeUniqueId('NaN');

  return JSON.stringify(
    value,
    (_, value) => {
      if (value === void 0) {
        return undefId;
      }

      if (Number.isNaN(value)) {
        return nanId;
      }

      return value;
    },
    space,
  )
    .replace(new RegExp(JSON.stringify(undefId), 'g'), '<undefined>')
    .replace(new RegExp(JSON.stringify(nanId), 'g'), 'NaN');
}