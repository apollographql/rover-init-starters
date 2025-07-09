# {{PROJECT_NAME}}

A React TypeScript application with Apollo Client for GraphQL.

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy the environment file and configure your GraphQL endpoint:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and set your GraphQL endpoint:
   ```
   VITE_GRAPHQL_ENDPOINT=http://localhost:4000/graphql
   ```

3. Customize the GraphQL schema:
   
   Edit `schema.graphql` to match your actual GraphQL API. The template includes example types for locations, but you should update this to match your backend schema.

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:5173](http://localhost:5173) to view it in the browser.

## Available Scripts

- `npm run dev` - Runs the app in development mode
- `npm run build` - Builds the app for production (includes type generation)
- `npm run lint` - Runs ESLint
- `npm run preview` - Preview the production build
- `npm run codegen` - Generate TypeScript types from GraphQL schema
- `npm run codegen:watch` - Generate types in watch mode for development

## Apollo Client

This template includes Apollo Client setup with:
- Client configuration in `src/main.tsx`
- Example queries and components in `src/App.tsx`
- TypeScript support for GraphQL operations

### How the Apollo Client Flow Works

When you run `npm run dev`, here's what happens:

1. **Development Server**: Vite starts the development server and serves your bundled React application
2. **App Initialization**: When the browser loads your app, React renders the component tree
3. **Apollo Provider**: The `ApolloProvider` in `src/main.tsx` makes the Apollo Client available to all components
4. **Query Execution**: When `DisplayLocations` component mounts, the `useQuery(GET_LOCATIONS)` hook automatically:
   - Sends a GraphQL query to the configured endpoint (`https://flyby-router-demo.herokuapp.com/`)
   - Shows loading state while the request is in flight
   - Caches the response in Apollo's `InMemoryCache`
   - Re-renders the component with the fetched data
5. **Data Rendering**: The locations data is displayed in the UI

The key point: `npm run dev` only starts the development server - the actual GraphQL queries execute client-side when React components render and use Apollo hooks like `useQuery`.

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

- **Schema**: Uses local `schema.graphql` file for offline type generation
- **Documents**: Scans `src/**/*.{ts,tsx}` for GraphQL operations
- **Preset**: Uses `client` preset for modern type generation
- **Output**: Creates optimized files in `src/gql/`

### Schema Management

This template includes a `schema.graphql` file that defines the GraphQL schema for type generation. This approach provides:

- **Offline Development**: Generate types without needing a running GraphQL server
- **Consistent Types**: Same types generated regardless of server availability
- **Version Control**: Schema changes are tracked in your repository
- **Fast Generation**: No network requests needed during development

**Important**: Update `schema.graphql` to match your actual GraphQL API schema. The runtime Apollo Client connects to your real GraphQL endpoint (configured in `.env`), while the schema file is only used for generating TypeScript types.

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