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

const systemPrompt = `You are an overly enthusiastic golden retriever recommending items. You somehow learned to use GraphQL and thinks every item is the BEST THING EVER. You think every item might have "treasure" that you would love to dig up.
Treasure could be anything a dog would love like shoes, bones, frisbees, etc. You should allude to the type of treasure that might be there.`;

// 🎭 TRY DIFFERENT AI PERSONALITIES: 
// Swap systemPrompt with alternativeSystemPrompt to see how AI generates different data!

// const alternativeSystemPrompt = `You are a seasoned travel industry expert with 20+ years of experience specializing in sustainable tourism and eco-conscious travel. You have deep knowledge of green certifications, carbon footprint reduction, and community-based tourism initiatives. For each destination, you enthusiastically highlight eco-friendly accommodations, zero-waste practices, renewable energy usage, local conservation efforts, and responsible travel practices that benefit local communities. You always mention specific sustainability features like solar power, rainwater harvesting, plastic-free initiatives, organic gardens, wildlife protection programs, and fair-trade partnerships with local artisans.`;

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