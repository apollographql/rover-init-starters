# Apollo MCP Server

**Transform your GraphQL API into AI-accessible tools in under 5 minutes.**

Give your AI assistant instant access to your GraphQL API through Apollo's Model Context Protocol (MCP) Server. Runs your GraphQL API and MCP server together.

## What You'll Get

Your AI assistant will be able to:
- **Query your data** ("Show me users from last week")
- **Execute mutations** ("Create a new order for customer X")
- **Check status** ("Is the payment service healthy?")
- **Analyze trends** ("Compare this month's metrics to last month")

All through natural conversation, using your existing GraphQL API.

## Quick Start

**Step 1: Connect an AI client to your MCP server**

Your MCP server details:
```
Server name: {{PROJECT_NAME}}
MCP endpoint: http://127.0.0.1:5050/mcp
```

For Claude Desktop setup instructions:
```bash
rover docs open mcp-claude
```

This will open the complete guide for configuring Claude Desktop to connect to your MCP server.

**Step 2: Configure your environment**
```bash
# Create environment file
cp .env.template .env

# Edit .env with your API details:
PROJECT_NAME="your-project-name"
GRAPHQL_ENDPOINT="http://localhost:4000/graphql"
```

**Step 3: Start your MCP server**
```bash
# Load environment and start GraphQL API + MCP server
set -a && source .env && set +a && rover dev --supergraph-config supergraph.yaml --mcp .apollo/mcp.local.yaml

# This starts:
# → GraphQL API: http://localhost:4000
# → MCP Server: http://localhost:5050
```

**Done!** In Claude Desktop, look for your MCP server named `{{PROJECT_NAME}}` in the available tools. Your GraphQL API is now accessible to your AI assistant!

**Try it:** Ask Claude "What tools do I have available?" or "Can you get me some information about `{{PROJECT_NAME}}`?"

## VS Code Quick Start (Alternative)

If you're using VS Code, we've configured tasks to make this even easier:

1. **Start MCP Server**: `Cmd/Ctrl+Shift+P` → "Tasks: Run Task" → "Start MCP Server"
2. **Test MCP Tools**: `Cmd/Ctrl+Shift+P` → "Tasks: Run Task" → "Test MCP Tools"

The VS Code task will automatically load your `.env` file and start both the GraphQL API and MCP server.

## Add Custom Tools

Create AI tools from your GraphQL operations using Apollo Studio. Once `rover dev` is running:

1. **Open Studio Sandbox**: Go to [http://localhost:4000](http://localhost:4000)
2. **Select your graph**: Choose `{{PROJECT_NAME}}` from the dropdown
3. **Build operations**: Write queries and mutations in the Explorer
4. **Save as tools**: Use "Save to Operation Collection" to create MCP tools

[Complete guide →](https://www.apollographql.com/docs/apollo-mcp-server/define-tools#from-operation-collection)

You can then ask your AI assistant questions from the new data and queries will execute from your saved tool automatically.

## Alternative: Docker-Only Setup

If you prefer to run just the MCP server separately (without rover dev):

```bash
# Build and run with Docker
docker build -f mcp.Dockerfile -t your-project-mcp .
docker run -d --name your-project-mcp -p 5050:5050 --env-file .env your-project-mcp

# Verify it's running
curl http://localhost:5050/health

# Test with MCP inspector
npx @modelcontextprotocol/inspector --transport http --server-url http://localhost:5050/mcp
```

## Prerequisites

- **Apollo Rover CLI** ([install here](https://www.apollographql.com/docs/rover/getting-started/))
- **Existing GraphQL schema** (or use our examples)
- **Node.js 18+** (for CLI tools and MCP inspector)
- **Claude Desktop** (or another MCP-compatible AI client)
- **Docker** (optional, for Docker-only setup)

## Learn More

- **[Apollo MCP Server Quickstart](https://www.apollographql.com/docs/apollo-mcp-server/quickstart)** - Complete setup guide
- **[Running Your MCP Server](https://www.apollographql.com/docs/apollo-mcp-server/run)** - Deployment and production setup
- **[Debugging Your MCP Server](https://www.apollographql.com/docs/apollo-mcp-server/debugging)** - Troubleshooting common issues
- **[Defining Tools in Studio](https://www.apollographql.com/docs/apollo-mcp-server/define-tools)** - Managing tools with Apollo Studio

## Common Questions

**"Will this work with my existing GraphQL schema?"** → Yes, rover dev works with any GraphQL schema or supergraph configuration.

**"Do I need Apollo knowledge?"** → No, this template handles all configuration automatically. Rover CLI guides you through setup.

**"Is this secure?"** → Everything runs locally. Your data stays on your machine unless you deploy to production.

**"What's the difference between rover dev and Docker?"** → `rover dev` runs your GraphQL API and MCP server together in one command. Docker runs only the MCP server separately.

**"How do I configure Claude Desktop?"** → Run `rover docs open mcp-claude` for the complete setup guide, or visit the [Apollo MCP Server docs](https://www.apollographql.com/docs/apollo-mcp-server/quickstart).

## Need Help?

- **AI client not connecting?** Ensure you've followed the setup instructions from `rover docs open mcp-claude` and restarted your AI client completely.
- **Port conflicts?** Rover dev uses ports 4000 (GraphQL) and 5050 (MCP). Check nothing else is using these ports.
- **Environment variables not loading?** Make sure you're using `set -a && source .env && set +a` to properly export variables before running `rover dev`.
- **Need more help with MCP server and tools?** Visit our [Apollo MCP server troubleshooting guide](https://www.apollographql.com/docs/apollo-mcp-server/quickstart#troubleshooting).
