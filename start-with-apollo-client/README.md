# {{PROJECT_NAME}}

A React TypeScript application with Apollo Client for GraphQL that starts as an **AI-powered playground** and can be easily configured to connect to your real GraphQL API.

## 🎭 Demo Mode (Default)

This template starts in **demo mode** using AI-powered mocking, perfect for:
- Exploring [Apollo Client](https://www.apollographql.com/docs/react) and GraphQL concepts without needing a backend
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

## 🚀 Get Started

### Step 1: Configure your endpoint

Create a `.env` file and set your endpoint:
```bash
cp .env.example .env
```

Edit `.env` to reflect your own endpoint:
```
GRAPHQL_ENDPOINT=https://your-graphql-api.com/graphql
```

### Step 2: Update schema configuration

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

### Step 3: Generate types from your real schema

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

When you're ready to connect to your own endpoint, update the code in `src/main.tsx`:
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

You can learn more about how the Apollo Client flow works [here](https://www.apollographql.com/docs/react/why-apollo).

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

### Customizing AI Mock Behavior

The AI responses are controlled by the `systemPrompt` variable in `src/main.tsx` (lines 22-23). By customizing this prompt, you can tailor the AI-generated data to match your specific domain or use case.

**Location:** `src/main.tsx`
```typescript
const systemPrompt = `You are an overly enthusiastic golden retriever...`;
```

**How to customize:**
1. **Edit the system prompt** - Replace the default prompt with your own
2. **Restart the dev server** - Run `npm run dev` again to see changes
3. **Test your queries** - The AI will generate data matching your new prompt

**Domain-specific examples:**

**E-commerce Store:**
```typescript
const systemPrompt = `You are an expert e-commerce merchandiser who creates compelling product descriptions. Generate realistic product data with detailed descriptions, competitive pricing, accurate inventory levels, and customer reviews. Focus on products that would appeal to modern consumers and include relevant categories, brands, and specifications.`;
```

**Social Media Platform:**
```typescript
const systemPrompt = `You are a social media content creator who generates engaging posts, realistic user profiles, and authentic interactions. Create diverse user demographics, trending topics, and natural conversation threads. Include realistic engagement metrics and user-generated content.`;
```

**Healthcare System:**
```typescript
const systemPrompt = `You are a healthcare data specialist who generates HIPAA-compliant, anonymized medical data. Create realistic patient records, appointment schedules, and treatment plans while maintaining privacy standards. Focus on common medical conditions and standard healthcare workflows.`;
```

**Real Estate Platform:**
```typescript
const systemPrompt = `You are a real estate market analyst who generates property listings, market data, and neighborhood information. Create realistic property descriptions, competitive pricing, accurate square footage, and detailed amenities. Include market trends and location-specific features.`;
```

**Pro tip:** The template includes an `alternativeSystemPrompt` example (lines 28) showing a travel industry expert. Uncomment and modify it to experiment with different AI personalities and see how they affect your data generation.

### Query-Level Prompts

While the system prompt applies to all GraphQL operations, you can customize AI behavior for specific queries using GraphQL comments. This allows fine-tuned control over how different operations generate mock data.

**How to add query-level prompts:**

Add a comment with `@aiPrompt` at the top of your GraphQL query:

```typescript
export const GET_ITEM_BY_ID = gql`
  # @aiPrompt: Generate detailed product information with technical specifications, customer reviews, and pricing history. Focus on electronics and gadgets.
  query GetItemById($id: ID!) {
    item(id: $id) {
      id
      name
      description
      photo
    }
  }
`;
```

**Multiple query examples:**

```typescript
export const GET_USER_PROFILE = gql`
  # @aiPrompt: Create realistic user profiles with diverse backgrounds, authentic social media activity, and varied interests. Include professional and personal details.
  query GetUserProfile($userId: ID!) {
    user(id: $userId) {
      id
      name
      bio
      avatar
    }
  }
`;

export const GET_INVENTORY_STATS = gql`
  # @aiPrompt: Generate business intelligence data with realistic inventory levels, seasonal trends, and supply chain insights. Use professional metrics terminology.
  query GetInventoryStats {
    inventory {
      totalItems
      lowStockItems
      reorderRequests
    }
  }
`;
```

**How it works:**
1. **Comment parsing**: The AI model extracts `@aiPrompt` directives from GraphQL comments
2. **Prompt combination**: Query-level prompts override the system prompt for that specific operation
3. **Fallback behavior**: Queries without `@aiPrompt` use the system prompt
4. **Restart required**: Changes require restarting `npm run dev`

This approach gives you granular control over AI behavior while maintaining the simplicity of the system-level prompt for general use.

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