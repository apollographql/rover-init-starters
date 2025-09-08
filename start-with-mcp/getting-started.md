- [Overview](#overview)
- [Designing your graph](#designing-your-graph)
  - [IDE extensions for graph development](#ide-extensions-for-graph-development)
  - [Working on your graph locally](#working-on-your-graph-locally)
  - [The design process](#the-design-process)
  - [Debugging Apollo Connectors](#debugging-apollo-connectors)
- [Publishing changes to GraphOS Studio](#publishing-changes-to-graphos-studio)
- [Deploying Apollo Router and MCP Server](#deploying-apollo-router-and-mcp-server)
- [Security](#security)
- [Additional resources](#additional-resources)
  - [Graph development](#graph-development)
  - [Apollo Connectors](#apollo-connectors)
  - [Apollo MCP Server](#apollo-mcp-server)
  - [Apollo Router](#apollo-router)


# Overview

👋 Hi there!

Your new graph is set up with [Apollo Federation](https://www.apollographql.com/docs/graphos/schema-design/federated-schemas/federation) and the [Apollo MCP Server](https://www.apollographql.com/docs/apollo-mcp-server). This project demonstrates how to build a community-driven GraphQL server that integrates multiple REST APIs through Apollo Connectors.

This template includes two main subgraphs:
- **AWS subgraph** (`aws.graphql`): Handles event management and speaker submissions using AWS Lambda and DynamoDB
- **Events subgraph** (`events.graphql`): Integrates with the Luma API for community event data

The project uses [Apollo Connectors](https://www.apollographql.com/docs/graphos/connectors) to connect REST APIs directly to your GraphQL schema without writing resolver code. You can integrate AWS services, Luma events, and other APIs using declarative directives.

# Designing your graph

## IDE extensions for graph development

[Apollo's IDE extensions](https://www.apollographql.com/docs/ide-support) are designed to help you catch and correct any issues related to schema design as early as possible. Lean on their instant feedback and autocomplete capabilities to help you create the types, fields, arguments, and connectors.

## Working on your graph locally

After completing the `rover init` flow, you'll have two options for running the server locally:

### Option 1: Using Apollo MCP Server directly

1. Download [Apollo MCP Server](https://www.apollographql.com/docs/apollo-mcp-server/command-reference#linux--macos-installer)
2. Create a `.env` file with your Apollo keys:
   ```
   APOLLO_KEY=service:your-service-key
   APOLLO_GRAPH_REF=your-graph@current
   LUMA_API_KEY=your-luma-api-key
   ```
3. Start the MCP Server:
   ```
   APOLLO_KEY=... APOLLO_GRAPH_REF=... ./apollo-mcp-server mcp-config.yaml
   ```

### Option 2: Using Docker

1. Build the containers:
   ```
   docker build --tag mcp-server-builder-series-mcp -f mcp.Dockerfile .
   docker build --tag mcp-server-builder-series-router -f router.Dockerfile .
   ```
2. Run the services:
   ```
   docker run -it --env-file .env -p5000:5000 mcp-server-builder-series-mcp
   docker run -it --env-file .env -p4000:4000 mcp-server-builder-series-router
   ```

## The design process

The best way to get started with schema design is to check out the different [schema types](https://www.apollographql.com/docs/graphos/schema-design) that make up your graph. You can also go straight to Apollo's schema design guides, starting with [Demand-Oriented Schema Design](https://www.apollographql.com/docs/graphos/schema-design/guides/demand-oriented-schema-design).

## Debugging Apollo Connectors

In Apollo Sandbox, you can access the Connectors Debugger by selecting it from the Response drop-down on the right side of your screen. The debugger will provide detailed insights into network calls, including response bodies, errors, and connector-related syntax. You can also visit Apollo's docs to [learn more about troubleshooting Connectors](https://www.apollographql.com/docs/graphos/schema-design/connectors/troubleshooting#return-debug-info-in-graphql-responses).

# Publishing changes to GraphOS Studio

Publishing your graph saves your schema to the GraphOS registry, allowing you to track its evolution and collaborate smoothly with your team when needed. GraphOS handles your first publish for you during `init` and creates an environment (or graph variant) called `current`, but any subsequent changes you make will require additional publishes.

Once you're happy with the state of your graph, replace the placeholder items in these commands with your own and run them:

```bash
# Publish AWS subgraph
rover subgraph publish your-graph-id@current \
  --schema "./connectors/aws.graphql" \
  --name aws \
  --routing-url http://connector

# Publish Events subgraph
rover subgraph publish your-graph-id@current \
  --schema "./connectors/events.graphql" \
  --name events \
  --routing-url http://luma
```

# Deploying Apollo Router and MCP Server

For your supergraph to work, you need to deploy both the Apollo MCP Server and Apollo Router:

**The Apollo MCP Server** handles operations and tools integration, providing the bridge between your GraphQL queries and underlying REST APIs.

**The Apollo Router** serves your federated GraphQL API and handles request routing between subgraphs.

Both services need to be accessible and properly configured with your environment variables (Apollo keys, API keys for external services like Luma, AWS credentials, etc.).

If you'd like guidance on deployment, [head over to Studio](https://studio.apollographql.com/) to set your endpoint and review deployment options.

# Security

For a more secure and reliable API, Apollo recommends:

- **Environment-specific configurations**: Use the provided staging and production YAML files with proper authentication
- **AWS authentication**: Configure AWS Signature Version 4 authentication for Lambda and DynamoDB access
- **JWT authentication**: Set up proper JWT validation for production environments
- **API key management**: Secure your Luma API keys and other external service credentials
- **CORS and introspection**: Update your CORS policy and disable introspection for production

Making these updates helps safeguard your API against common vulnerabilities and unauthorized access. To learn more, check out [Apollo's documentation on Graph Security](https://www.apollographql.com/docs/graphos/platform/security/overview).

# Additional resources

## Graph development
- [Introduction to Apollo Federation](https://www.apollographql.com/docs/graphos/schema-design/federated-schemas/federation)
- [Schema Design with Apollo GraphOS](https://www.apollographql.com/docs/graphos/schema-design)
- [IDE support for schema development](https://www.apollographql.com/docs/graphos/schema-design/ide-support)

## Apollo Connectors
- [Apollo Connectors Quickstart](https://www.apollographql.com/docs/graphos/connectors/getting-started)
- [Connectors Community Repo](https://github.com/apollographql/connectors-community)

## Apollo MCP Server
- [Apollo MCP Server Documentation](https://www.apollographql.com/docs/apollo-mcp-server)
- [MCP Server Command Reference](https://www.apollographql.com/docs/apollo-mcp-server/command-reference)

## Apollo Router
- [Self-hosting the Apollo Router](https://www.apollographql.com/docs/graphos/routing/self-hosted)
- [Router configuration](https://www.apollographql.com/docs/graphos/routing/configuration)