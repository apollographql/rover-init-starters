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
- `npm run build` - Builds the app for production
- `npm run lint` - Runs ESLint
- `npm run preview` - Preview the production build

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

## Learn More

- [React Documentation](https://reactjs.org/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [Apollo Client Documentation](https://www.apollographql.com/docs/react/)
- [Vite Documentation](https://vitejs.dev/)