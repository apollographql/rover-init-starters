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
- Client configuration in `src/apollo/client.ts`
- Example queries in `src/apollo/queries/`
- TypeScript support for GraphQL operations

## Learn More

- [React Documentation](https://reactjs.org/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [Apollo Client Documentation](https://www.apollographql.com/docs/react/)
- [Vite Documentation](https://vitejs.dev/)