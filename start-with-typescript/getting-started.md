👋 Hi there! The following guide walks you through building a subgraph–a service in a federated architecture–with Apollo Server and TypeScript.

- [Setup](#setup)
  - [Make your first request](#make-your-first-request)
  - [Components of a GraphQL server](#components-of-a-graphql-server)
    - [The schema](#the-schema)
    - [Resolvers](#resolvers)
    - [The server](#the-server)
  - [Type safety](#type-safety)
- [Time to build your API](#time-to-build-your-api)
- [Debugging your schema](#debugging-your-schema)
  - [Design your schema with Apollo’s IDE extensions](#design-your-schema-with-apollos-ide-extensions)
  - [Check for errors each time you save](#check-for-errors-each-time-you-save)
- [Publishing your changes to GraphOS Studio](#publishing-your-changes-to-graphos-studio)
- [Security](#security)
- [Additional resources](#additional-resources)
  - [More on GraphQL API development](#more-on-graphql-api-development)
  - [More on federation](#more-on-federation)
  - [Deploying your GraphQL API](#deploying-your-graphql-api)


# Setup

## Make your first request
1. Open `products.graphql` and take a look at your starter schema.
2. In the terminal, run the `rover dev` command shown under `Next steps` to start a development session. This gives you access to Apollo Sandbox—a local, in-browser GraphQL playground, where you can run GraphQL operations and test your API as you design it.
3. In Sandbox, paste the following GraphQL query in the Operation section:

```
query GetProducts {
  products {
    id
    name
    description
  }
}
```

4. Click  `► GetProducts` to run the request. You'll get a response back with data for the product's id, name, and description; exactly the properties we asked for in our query! 🎉

## Components of a GraphQL server

### The schema
The schema describes what data is available, how it’s structured, and how it can be requested or modified. It’s written using GraphQL’s Schema Definition Language (SDL), which lets you define the shape and capabilities of an API in a clear, type-safe way that is also backend-agnostic.

You can find the schema for this project in `products.graphql`.

### Resolvers
A resolver function populates the data for a particular field in the schema. Resolvers are defined in a resolvers map that follows the hierarchy of the schema.

You can find the resolvers for this project in `src/resolvers`. Each file corresponds to a type in your schema.

### The server
Where the GraphQL server is configured and started. 

You can find the server in `src/index.ts`.

## Type safety
The [GraphQL Code Generator](https://the-guild.dev/graphql/codegen) reads in a GraphQL schema and generates TypeScript types we can use throughout our server. It keeps our TypeScript types from getting outdated as we make changes to the schema, allowing us to focus on developing it rather than constantly updating type definitions.

# Time to build your API

You’re all set to start building. You'll be working primarily with the `products.graphql` file.

First, make sure you’ve installed and configured your [IDE extension of choice](https://www.apollographql.com/docs/graphos/schema-design/ide-support) so you can rely on its autocompletion, schema information, and syntax highlighting features.

Then, follow the development cycle below:
1. Define the types and fields in the schema.
2. Write the resolver function(s) that provide the data for those types and fields.
3. Run operations and debug your API following the instructions in the section below.

📓 **Note:** The GraphQL Code Generator has been automatically set up and configured for you. If you update your schema, run `npm run codegen` to ensure your generated types are up to date as well.

# Debugging your schema
The Apollo dev toolkit includes a few debugging tools to help you design and develop your GraphQL API. The journey looks a little something like this:

1. Design your schema with Apollo’s IDE extensions
2. Check for errors each time you save
3. Rinse and repeat until you're happy with your API!

## Design your schema with Apollo’s IDE extensions
Apollo’s IDE extensions are designed to help you catch and correct any issues related to schema design as early as possible. Lean on their instant feedback and autocomplete capabilities to help you create types, fields, arguments, and connectors.

## Check for errors each time you save
With `rover dev`, Rover starts watching your files for updates. Every time you make a change, Rover checks to see if the schema is valid. You can think of it as “hot-reloading” for your GraphQL schema. [More details about the dev command](https://www.apollographql.com/docs/rover/commands/dev).

# Publishing your changes to GraphOS Studio

When you publish a schema to GraphOS, it becomes part of your schema’s version history and is available for checks, composition, and collaboration. When you run `init`, Rover publishes your schema to GraphOS. 

Once you’ve made changes to your schema files and are happy with the state of your API, or if you’d like to test the experience of publishing schema changes to GraphOS Studio, paste and run the following command in your terminal:

```
rover subgraph publish your-graph-id@main \ # Replace this with your `APOLLO_GRAPH_REF` value
  --schema "./products.graphql" \
  --name products-subgraph \
  --routing-url "https://my-running-subgraph.com/api" # If you don't have a running API yet,replace this with http://localhost:4000
```

📓 **Note:** For production-ready APIs, [integrating Rover into your CI/CD](https://www.apollographql.com/docs/rover/ci-cd) ensures schema validation, reduces the risk of breaking changes, and improves collaboration.

# Security
For a more secure and reliable API, Apollo recommends updating your CORS policy and introspection settings for production or any published/publicly accessible environments. You can do so by:


- Specifying which origins, HTTP methods, and headers are allowed to interact with your API
- Turning off GraphQL introspection to limit the exposure of your API schema

Making these updates helps safeguard your API against common vulnerabilities and unauthorized access. To learn more, [review Apollo’s documentation on Graph Security](https://www.apollographql.com/docs/graphos/platform/security/overview).

# Additional resources

## More on GraphQL API development
- [GraphQL basics](https://graphql.com/learn/what-is-graphql/)
- [How does a GraphQL server work?](https://graphql.com/learn/how-does-graphql-work/)
- [Introduction to Apollo Server](https://www.apollographql.com/docs/apollo-server)
- [Introduction to Apollo Federation](https://www.apollographql.com/docs/graphos/schema-design/federated-schemas/federation)
- [Schema Design with Apollo GraphOS](https://www.apollographql.com/docs/graphos/schema-design)
- [IDE support for schema development](https://www.apollographql.com/docs/graphos/schema-design/ide-support)

## More on federation
- [Tutorial: Federation with TypeScript & Apollo Server](https://www.apollographql.com/tutorials/intro-typescript)
- [More educational materials covering TypeScript and Federation](https://www.apollographql.com/tutorials/browse/?categories=federation&languages=TypeScript)
- [Entities in Apollo Federation](https://www.apollographql.com/docs/graphos/schema-design/federated-schemas/entities/intro)

## Deploying your GraphQL API
- [Supergraph routing with GraphOS Router](https://www.apollographql.com/docs/graphos/routing/about-router)
- [Self-hosted Deployment](https://www.apollographql.com/docs/graphos/routing/self-hosted)
- [Router configuration](https://www.apollographql.com/docs/graphos/routing/configuration)