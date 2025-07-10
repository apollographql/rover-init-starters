import * as React from 'react';

import { ApolloClient, ApolloLink, ApolloProvider, InMemoryCache as Cache, type ApolloCache, type DefaultOptions, type Resolvers } from '@apollo/client';
import { MockLink, type MockedResponse } from './MockLink';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface MockedProviderProps<TSerializedCache = {}> {
  mocks?: ReadonlyArray<MockedResponse<any, any>>;
  addTypename?: boolean;
  defaultOptions?: DefaultOptions;
  cache?: ApolloCache<TSerializedCache>;
  resolvers?: Resolvers;
  childProps?: object;
  children?: any;
  link?: ApolloLink;
  showWarnings?: boolean;
  /**
   * If set to true, the MockedProvider will try to connect to the Apollo DevTools.
   * Defaults to false.
   */
  connectToDevTools?: boolean;
  systemPrompt?: string;
}

export interface MockedProviderState {
  client: ApolloClient<any>;
}

export class MockedProvider extends React.Component<
  MockedProviderProps,
  MockedProviderState
> {
  public static defaultProps: MockedProviderProps = {
    addTypename: true,
  };

  constructor(props: MockedProviderProps) {
    super(props);

    const {
      mocks,
      addTypename,
      defaultOptions,
      cache,
      resolvers,
      link,
      showWarnings,
      systemPrompt,
      connectToDevTools = false,
    } = this.props;
    const client = new ApolloClient({
      cache: cache || new Cache({ addTypename }),
      defaultOptions,
      connectToDevTools,
      link: link || new MockLink(mocks || [], addTypename, { showWarnings, systemPrompt }),
      resolvers,
    });

    this.state = {
      client,
    };
  }

  public render() {
    const { children, childProps } = this.props;
    const { client } = this.state;

    return React.isValidElement(children) ? (
      <ApolloProvider client={client}>
        {React.cloneElement(React.Children.only(children), { ...childProps })}
      </ApolloProvider>
    ) : null;
  }

  public componentWillUnmount() {
    // Since this.state.client was created in the constructor, it's this
    // MockedProvider's responsibility to terminate it.
    this.state.client.stop();
  }
}
