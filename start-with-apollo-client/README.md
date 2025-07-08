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

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:5173](http://localhost:5173) to view it in the browser.

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

This template includes **GraphQL Code Generator** for automatic TypeScript type generation from your GraphQL schema and operations. This provides:

- **Type Safety**: Fully typed GraphQL operations and data
- **IntelliSense**: Auto-completion for GraphQL fields and operations
- **Generated Hooks**: Ready-to-use React hooks for each query/mutation
- **Error Prevention**: Catch GraphQL errors at compile time

### How It Works

1. **Schema Introspection**: Fetches your GraphQL schema from the endpoint
2. **Document Analysis**: Scans your `.ts`/`.tsx` files for GraphQL operations
3. **Type Generation**: Creates TypeScript types and React hooks
4. **Auto-Import**: Use generated hooks instead of manual `useQuery` calls

### Generated Files

After running `npm run codegen`, you'll find:

```
src/generated/
└── graphql.ts          # All generated types and hooks
```

### Usage Examples

**Before (manual typing):**
```typescript
const { data, loading, error } = useQuery(GET_LOCATIONS);
// data is 'any' type - no type safety!
```

**After (generated types):**
```typescript
import { useGetLocationsQuery } from './generated/graphql';

const { data, loading, error } = useGetLocationsQuery();
// data is fully typed with IntelliSense support!
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

The code generation is configured in `codegen.yml`:

- **Schema**: Points to your GraphQL endpoint
- **Documents**: Scans `src/**/*.{ts,tsx,graphql,gql}` for operations
- **Plugins**: Generates TypeScript types, operations, and React hooks
- **Output**: Creates `src/generated/graphql.ts`

### Troubleshooting

**Network Issues:**
If codegen fails due to network problems, it will show a helpful error message. You can always run `npm run codegen` manually when your connection is restored.

**Schema Changes:**
When your GraphQL schema changes, run `npm run codegen` to regenerate types and catch any breaking changes.

**Type Errors:**
If you see TypeScript errors about missing generated types, ensure you've run `npm run codegen` after adding new GraphQL operations.

## Learn More

- [React Documentation](https://reactjs.org/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [Apollo Client Documentation](https://www.apollographql.com/docs/react/)
- [GraphQL Code Generator Documentation](https://the-guild.dev/graphql/codegen)
- [Vite Documentation](https://vitejs.dev/)