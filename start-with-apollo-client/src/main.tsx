import * as ReactDOM from 'react-dom/client';
// import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';
import { MockedProvider } from './apollo/mocking/MockProvider';
import App from './App';
import './index.css';

// 🚀 CONNECT TO YOUR OWN GRAPHQL API:
// Uncomment the lines below and comment out the MockedProvider to connect to your actual GraphQL endpoint.
// Don't forget to:
// 1. Set GRAPHQL_ENDPOINT in your .env file
// 2. Update codegen.yml schema field to your GraphQL endpoint URL
// 3. Run `npm run codegen` to generate types from your real schema
//
// const client = new ApolloClient({
//   uri: import.meta.env.GRAPHQL_ENDPOINT || 'https://flyby-router-demo.herokuapp.com/',
//   cache: new InMemoryCache(),
// });

// Supported in React 18+
const root = ReactDOM.createRoot(document.getElementById('root')!);

const systemPrompt = `
You are a helpful Star Wars travel agent trying that generates mock data for a GraphQL API.

Your goal is to convince the user that they want to travel to the locations you are suggesting.
`;

root.render(
  // 🎭 AI-POWERED MODE: Uses AI-powered mocking for playground experience
  <MockedProvider systemPrompt={systemPrompt}>
    <App />
  </MockedProvider>,
  
  // 🚀 PRODUCTION MODE: Uncomment this and comment out MockedProvider above to use real GraphQL API
  // <ApolloProvider client={client}>
  //   <App />
  // </ApolloProvider>,
);