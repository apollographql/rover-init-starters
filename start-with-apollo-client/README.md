# {{PROJECT_NAME}}

A React TypeScript application with Apollo Client for GraphQL that starts as an **AI-powered playground** and can be easily configured to connect to your real GraphQL API.

## 🎭 Demo Mode (Default)

This template starts in **demo mode** using AI-powered mocking, perfect for:
- Exploring GraphQL concepts without needing a backend
- Prototyping and experimentation
- Seeing the power of GraphQL capabilities

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:5173](http://localhost:5173) to view the demo in your browser.

The app will work immediately with AI-generated mock data!

## 🚀 Connect to Your Own API Endpoint

When you're ready to connect to your actual endpoint:

### Step 1: Update the code in `src/main.tsx`

```typescript
// Comment out the MockedProvider:
// <MockedProvider systemPrompt={systemPrompt}>
//   <App />
// </MockedProvider>

// Uncomment the ApolloProvider:
<ApolloProvider client={client}>
  <App />
</ApolloProvider>
```

### Step 2: Configure your endpoint

Create a `.env` file and set your endpoint:
```bash
cp .env.example .env
```

Edit `.env`:
```
GRAPHQL_ENDPOINT=https://your-graphql-api.com/graphql
```

### Step 3: Update schema configuration

Edit `codegen.yml` to point to your GraphQL endpoint:
```yaml
schema: 'https://your-graphql-api.com/graphql'  # Replace the local schema.graphql
documents: ['src/**/*.{ts,tsx}']
ignoreNoDocuments: true
generates:
  src/gql/:
    preset: client
    config:
      useTypeImports: true
```

### Step 4: Generate types from your real schema

```bash
npm run codegen
```

This will fetch your schema via introspection and generate TypeScript types for your actual GraphQL API.

## Available Scripts

- `npm run dev` - Runs the app in development mode
- `npm run build` - Builds the app for production
- `npm run lint` - Runs ESLint
- `npm run preview` - Preview the production build

## Apollo Client (Production Mode)

When you switch from demo mode to production mode, this template includes Apollo Client setup with:
- Client configuration in `src/main.tsx`
- Example queries and components in `src/App.tsx`
- TypeScript support for GraphQL operations

### How the Apollo Client Flow Works

When you configure a real GraphQL endpoint and run `npm run dev`:

1. **Development Server**: Vite starts the development server and serves your bundled React application
2. **App Initialization**: When the browser loads your app, React renders the component tree
3. **Apollo Provider**: The `ApolloProvider` in `src/main.tsx` makes the Apollo Client available to all components
4. **Query Execution**: When components mount, the [`useQuery` hooks](https://www.apollographql.com/docs/react/data/queries/) (which check the local cache first, then fetch from the network) automatically:
   - Send GraphQL queries to your configured endpoint
   - Show loading state while requests are in flight
   - Cache responses in Apollo's `InMemoryCache`
   - Re-render components with the fetched data
5. **Data Rendering**: The real data from your GraphQL API is displayed in the UI

The key point: `npm run dev` only starts the development server - the actual GraphQL queries execute client-side when React components render and use Apollo hooks like `useQuery`.

## AI-Powered Demo Mode

The default demo mode uses a sophisticated mocking system that:

- **AI-Generated Responses**: Uses AI to generate realistic GraphQL responses based on your schema
- **Smart Mocking**: Understands GraphQL schema structure and generates appropriate mock data
- **Interactive Experience**: Provides a fully functional GraphQL experience without needing a backend
- **Customizable System Prompt**: The AI behavior can be customized via the `systemPrompt` in `src/main.tsx`

### How Demo Mode Works

1. **Schema Validation**: The `MockedProvider` validates your GraphQL operations against the local schema
2. **AI Response Generation**: When queries execute, AI generates realistic responses based on the schema and system prompt
3. **GraphQL Compliance**: All responses follow proper GraphQL structure and typing
4. **Development Experience**: You get the full Apollo Client experience with loading states, caching, and error handling

This mode is perfect for:
- Learning GraphQL concepts
- Prototyping without backend dependencies
- Demonstrating GraphQL capabilities
- Developing frontend features before backend APIs are ready

## Next Steps
This template creates a **local React application** - no GraphOS graph is created automatically. 
When you feel ready to connect your app to an API, you can connect to any existing GraphQL API, or create a new one.

### 1. Connect a Graph
#### Connect to an existing GraphQL endpoint
1.  **Configure your Apollo Client** with your GraphOS endpoint:
   ```typescript
   const client = new ApolloClient({
     uri: 'https://your-graph.apollographql.com/graphql',
     headers: {
       'Apollo-Require-Preflight': 'true'
     },
     cache: new InMemoryCache(),
   });
   ```
2. **Update the VITE_GRAPHQL_ENDPOINT in your .env file**

#### Create a new Graph 
1. [Does Not Exist Yet] **Infer your schema** Using the rover supergraph infer command   
2. **Convert your schema to a graph** Connect to Apollo Studio:
    a. **Create a graph** at [studio.apollographql.com](https://studio.apollographql.com)
    b. **Get your API key** from your graph's settings
    c. **Configure your Apollo Client** with your GraphOS endpoint:
        ```typescript
        const client = new ApolloClient({
            uri: 'https://your-graph.apollographql.com/graphql',
            headers: {
            'Apollo-Require-Preflight': 'true'
            },
            cache: new InMemoryCache(),
        });
        ```
     d. [Does Not Exist Yet] **Publish your schema** using the rover subgraph publish batch publish command  

##### Consider GraphOS when you need:
- **Team Collaboration**: Share schemas and coordinate changes across multiple developers
- **Schema Registry**: Centralized schema management with version history and validation
- **Production Monitoring**: Query performance insights, error tracking, and usage analytics
- **Federation**: Combine multiple GraphQL services into a unified API
- **Schema Checks**: Validate schema changes before deployment to prevent breaking changes**For local development**: Continue using your current setup with any GraphQL endpoint. GraphOS is most valuable when you're ready to deploy to production or collaborate with a team.

### 2. Introspect your schema

Before connecting to a GraphQL API, explore its schema structure:

1. **Open GraphQL Playground** in your browser:
   ```bash
   # Replace with your actual endpoint
   open https://your-graphql-api.com/graphql
   ```

2. **Run introspection query** to see available types and operations:
   ```graphql
   query IntrospectionQuery {
     __schema {
       types {
         name
         kind
         fields {
           name
           type {
             name
           }
         }
       }
     }
   }
   ```

3. **Browse the schema** to understand what queries and mutations are available for your frontend.

### 3. Setup your CodeGen

Generate TypeScript types from your GraphQL schema automatically:

1. **Configure codegen.yml** to point to your endpoint:
   ```yaml
   schema: 'https://your-graphql-api.com/graphql'
   documents: ['src/**/*.{ts,tsx}']
   ignoreNoDocuments: true
   generates:
     src/gql/:
       preset: client
       config:
         useTypeImports: true
   ```

2. **Generate types** from your schema:
   ```bash
   npm run codegen
   ```

3. **Import generated types** in your components:
   ```typescript
   import { useQuery } from '@apollo/client';
   import { GetLocationsQuery } from '../gql/graphql';
   
   const { data, loading, error } = useQuery<GetLocationsQuery>(GET_LOCATIONS);
   ```

Your GraphQL operations now have full TypeScript support with autocomplete and type safety!

### 4. Iterate, Share, and Promote!
Congratulations!!! You now have a local react app linked to a graph. You can start building and collaborating with teammates on creating or iterating on a Graph-powered web app. 


## Learn More

- [React Documentation](https://reactjs.org/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [Apollo Client Documentation](https://www.apollographql.com/docs/react/)
- [GraphQL Code Generator Client Preset](https://the-guild.dev/graphql/codegen/plugins/presets/preset-client)
- [Vite Documentation](https://vitejs.dev/)