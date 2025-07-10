# {{PROJECT_NAME}}

A React TypeScript application with Apollo Client for GraphQL that starts as an **AI-powered demo playground** and can be easily configured to connect to your real GraphQL API.

## 🎭 Demo Mode (Default)

This template starts in **demo mode** using AI-powered mocking, perfect for:
- Exploring GraphQL concepts without needing a backend
- Prototyping and experimentation
- Learning Apollo Client patterns
- Demonstrating GraphQL capabilities

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

## 🚀 Connect to Your Real GraphQL API

When you're ready to connect to your actual GraphQL endpoint:

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

### Step 2: Configure your GraphQL endpoint

Create a `.env` file and set your GraphQL endpoint:
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
- `npm run build` - Builds the app for production (includes type generation)
- `npm run lint` - Runs ESLint
- `npm run preview` - Preview the production build
- `npm run codegen` - Generate TypeScript types from GraphQL schema
- `npm run codegen:watch` - Generate types in watch mode for development

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
4. **Query Execution**: When components mount, the `useQuery` hooks automatically:
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

## GraphQL Code Generation

This template uses **GraphQL Code Generator with Client Preset** for automatic TypeScript type generation from your GraphQL schema and operations. This provides:

- **Type Safety**: Fully typed GraphQL operations and data
- **IntelliSense**: Auto-completion for GraphQL fields and operations  
- **Zero Configuration**: Works automatically with existing queries
- **Tree Shaking**: Only generates types for operations you actually use
- **Fragment Masking**: Advanced type safety for GraphQL fragments

### How Client Preset Works

1. **Schema Introspection**: Fetches your GraphQL schema from the endpoint
2. **Document Scanning**: Finds GraphQL operations in your TypeScript files
3. **Smart Generation**: Only generates types for operations you use
4. **Automatic Imports**: The `graphql()` function provides instant type safety

### Generated Files

After running `npm run codegen`, you'll find:

```
src/gql/
├── index.ts           # Main export file
├── graphql.ts         # Generated types and operations
└── gql.ts             # Typed graphql() function
```

### Usage Examples

**Queries with Client Preset:**
```typescript
import { useQuery } from '@apollo/client';
import { graphql } from './gql';

const GET_LOCATIONS = graphql(/* GraphQL */ `
  query GetLocations {
    locations {
      id
      name
      description
      photo
    }
  }
`);

const { data, loading, error } = useQuery(GET_LOCATIONS);
// data is fully typed automatically!
```

### Development Workflow

**For active development:**
```bash
npm run codegen:watch
```
This watches your GraphQL files and regenerates types automatically.

**For production builds:**
```bash
npm run build
```
This runs codegen before building, ensuring types are always up-to-date.

### Configuration

The code generation is configured in `codegen.yml` for Client Preset:

- **Schema**: Uses local `schema.graphql` file by default (demo mode) or your GraphQL endpoint URL (production mode)
- **Documents**: Scans `src/**/*.{ts,tsx}` for GraphQL operations
- **Preset**: Uses `client` preset for modern type generation
- **Output**: Creates optimized files in `src/gql/`

### Schema Management

**Demo Mode**: Uses the included `schema.graphql` file for offline type generation. This provides:
- **Offline Development**: Generate types without needing a running GraphQL server
- **Consistent Types**: Same types generated regardless of server availability
- **Version Control**: Schema changes are tracked in your repository
- **Fast Generation**: No network requests needed during development

**Production Mode**: When you update `codegen.yml` to use your GraphQL endpoint URL, the system automatically:
- **Fetches Live Schema**: Uses introspection to get your real GraphQL schema
- **Stays in Sync**: Always generates types from your actual API
- **Validates Changes**: Catches breaking changes when your API schema evolves

The conditional codegen system automatically detects whether you're using a URL or local file and adjusts accordingly.

### Troubleshooting

**Schema Issues:**
If codegen fails, check that your `schema.graphql` file is valid GraphQL syntax. The template works offline since it uses a local schema file.

**Schema Updates:**
When your GraphQL API schema changes, update the `schema.graphql` file to match, then run `npm run codegen` to regenerate types and catch any breaking changes.

**Type Errors:**
If you see TypeScript errors about missing generated types, ensure you've run `npm run codegen` after adding new GraphQL operations.

**Import Errors:**
Make sure to import `graphql` from `./gql` (not `@apollo/client`) when using Client Preset.

## When to Connect to Apollo GraphOS

This template creates a **local React application** - no GraphOS graph is created automatically. You can develop and build your app using any GraphQL API.

### Consider GraphOS when you need:

- **Team Collaboration**: Share schemas and coordinate changes across multiple developers
- **Schema Registry**: Centralized schema management with version history and validation
- **Production Monitoring**: Query performance insights, error tracking, and usage analytics
- **Federation**: Combine multiple GraphQL services into a unified API
- **Schema Checks**: Validate schema changes before deployment to prevent breaking changes

### Getting Started with GraphOS

When you're ready to connect to Apollo Studio:

1. **Create a graph** at [studio.apollographql.com](https://studio.apollographql.com)
2. **Get your API key** from your graph's settings
3. **Configure your Apollo Client** with your GraphOS endpoint:
   ```typescript
   const client = new ApolloClient({
     uri: 'https://your-graph.apollographql.com/graphql',
     headers: {
       'Apollo-Require-Preflight': 'true'
     },
     cache: new InMemoryCache(),
   });
   ```

**For local development**: Continue using your current setup with any GraphQL endpoint. GraphOS is most valuable when you're ready to deploy to production or collaborate with a team.

## Learn More

- [React Documentation](https://reactjs.org/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [Apollo Client Documentation](https://www.apollographql.com/docs/react/)
- [GraphQL Code Generator Client Preset](https://the-guild.dev/graphql/codegen/plugins/presets/preset-client)
- [Vite Documentation](https://vitejs.dev/)