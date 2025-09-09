# mcp-builder-community-server

The MCP server for the MCP Server Builder Community

## Setup repo

1. Create a `.env` file locally with your Apollo key from GraphOS.

```
APOLLO_KEY=service:cfp-x3c983m:.....
APOLLO_GRAPH_REF=cfp-x3c983m@current
```

## Running locally

1. Download [Apollo MCP Server](https://www.apollographql.com/docs/apollo-mcp-server/command-reference#linux--macos-installer)
2. Start up MCP Server

```
APOLLO_KEY=... APOLLO_GRAPH_REF=... ./apollo-mcp-server mcp-config.yaml
```

## Running with Docker 

```
docker build --tag mcp-server-builder-series-mcp -f mcp.Dockerfile .
docker build --tag mcp-server-builder-series-router -f mcp.Dockerfile .
docker run -it --env-file .env -p5000:5000 mcp-server-builder-series-mcp
docker run -it --env-file .env -p4000:4000 mcp-server-builder-series-router
```