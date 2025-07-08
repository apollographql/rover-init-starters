import * as ReactDOM from 'react-dom/client';
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';
import App from './App';
import './index.css';

const client = new ApolloClient({
  uri: import.meta.env.VITE_GRAPHQL_ENDPOINT || 'https://flyby-router-demo.herokuapp.com/',
  cache: new InMemoryCache(),
});

// Supported in React 18+
const root = ReactDOM.createRoot(document.getElementById('root')!);

root.render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>,
);