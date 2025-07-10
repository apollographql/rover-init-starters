module.exports = {
  client: {
    name: "{{PROJECT_NAME}}",
    service: {
      name: "{{PROJECT_NAME}}",
      // Use local schema file by default for development
      localSchemaFile: "./schema.graphql",
      // Uncomment and configure when connecting to a real GraphQL endpoint
      // url: process.env.GRAPHQL_ENDPOINT || "https://your-graphql-api.com/graphql",
      // headers: {
      //   authorization: `Bearer ${process.env.APOLLO_KEY}`,
      // },
    },
    includes: ["src/**/*.{ts,tsx,js,jsx,graphql,gql}"],
    excludes: ["**/node_modules/**", "**/__tests__/**", "**/dist/**", "**/build/**"],
    tagName: "gql",
    // Apollo Language Server configuration
    validationRules: ["@graphql-eslint/require-id-when-available"],
    // Code generation configuration (integrates with existing codegen.yml)
    codegen: {
      // This tells Apollo VSCode extension to use the codegen.yml config
      configPath: "./codegen.yml",
      // Generate types on save
      generateOnSave: true,
      // Watch for schema changes
      watchSchema: true,
    },
    // TypeScript configuration
    typescript: {
      // Enable strict mode for better type safety
      strict: true,
      // Generate types for all operations
      generateOperationTypes: true,
      // Use type imports for better tree-shaking
      useTypeImports: true,
    },
    // Development features
    development: {
      // Enable query validation
      validateQueries: true,
      // Enable autocomplete
      autocomplete: true,
      // Enable schema introspection
      introspection: true,
    },
  },
};