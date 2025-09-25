# Apollo MCP Server

**Transform your GraphQL API into AI-accessible tools in under 5 minutes.**

Give your AI assistant instant access to your GraphQL API through Apollo's Model Context Protocol (MCP) Server. No complex setup required.

## ⚡ What You'll Get

Your AI assistant will be able to:
- **Query your data** ("Show me users from last week")
- **Execute mutations** ("Create a new order for customer X")
- **Check status** ("Is the payment service healthy?")
- **Analyze trends** ("Compare this month's metrics to last month")

All through natural conversation, using your existing GraphQL API.

## 🚀 Quick Start

**Step 1: Copy template to your GraphQL project**
```bash
# Navigate to your GraphQL project directory
cd /path/to/your/graphql/project

# Copy MCP template files
cp -r /path/to/rover-init-starters/add-mcp/* .
```

**Step 2: Configure your API endpoint**
```bash
# Create environment file
cp .env.template .env

# Edit .env with your API details:
PROJECT_NAME="your-project-name"
GRAPHQL_ENDPOINT="http://localhost:4000/graphql"
```

**Step 3: Start the MCP server**
```bash
# Build and run with Docker
docker build -f mcp.Dockerfile -t your-project-mcp .
docker run -d --name your-project-mcp -p 5000:5000 --env-file .env your-project-mcp

# Verify it's running
curl http://localhost:5000/health
```

**Step 4: Connect your AI assistant**
```bash
# Copy the configuration for Claude Desktop
# macOS:
cp claude_desktop_config.json ~/Library/Application\ Support/Claude/claude_desktop_config.json

# Windows:
copy claude_desktop_config.json "%APPDATA%\Claude\claude_desktop_config.json"

# Linux:
cp claude_desktop_config.json ~/.config/Claude/claude_desktop_config.json
```

**Step 5: Test the connection**
```bash
# Use the MCP inspector to verify your tools
npx @mcp/inspector --port 5000
```

**🎉 Done!** Restart Claude Desktop and look for the hammer icon (🔨). Your GraphQL API is now accessible to your AI assistant!

## 🛠️ Add Custom Tools

Each `.graphql` file in the `tools/` directory becomes an AI tool. Create new tools by adding GraphQL operations:

```graphql
# tools/GetUserProfile.graphql
query GetUserProfile($userId: ID!) {
  user(id: $userId) {
    id
    name
    email
    profile {
      avatar
      bio
    }
  }
}
```

Your AI assistant can now say: "Get the profile for user 123" and it will execute this query automatically.

## 📋 Prerequisites

- **Existing GraphQL API** (running on any port)
- **Docker** ([install here](https://docs.docker.com/get-docker/))
- **Node.js 18+** (for CLI tools)
- **Claude Desktop** (or another MCP-compatible AI client)

## 📖 Learn More

- **[Apollo MCP Server Quickstart](https://www.apollographql.com/docs/apollo-mcp-server/quickstart)** - Complete setup guide
- **[Running Your MCP Server](https://www.apollographql.com/docs/apollo-mcp-server/run)** - Deployment and production setup
- **[Debugging Your MCP Server](https://www.apollographql.com/docs/apollo-mcp-server/debugging)** - Troubleshooting common issues
- **[Defining Tools in Studio](https://www.apollographql.com/docs/apollo-mcp-server/define-tools)** - Managing tools with Apollo Studio

## ❓ Common Questions

**"Will this work with my existing GraphQL API?"** → Yes, any GraphQL API that responds to HTTP requests works out of the box.

**"Do I need Apollo knowledge?"** → No, this template handles all Apollo-specific configuration automatically.

**"Is this secure?"** → The MCP server connects to your local API only. Your data stays on your machine unless you deploy to production.

**"Can I use this in production?"** → Yes, see the [deployment documentation](https://www.apollographql.com/docs/apollo-mcp-server/run) for production setup.

## 🆘 Need Help?

- **Connection issues?** Check that your GraphQL endpoint is accessible: `curl -X POST http://your-endpoint/graphql -d '{"query":"{ __typename }"}'`
- **Tools not appearing?** Verify `.graphql` files exist in `tools/` directory and have valid GraphQL syntax
- **Claude Desktop not connecting?** Ensure the config file is in the correct location and restart Claude Desktop completely

---

*Part of [Apollo Rover Init Starters](https://github.com/apollographql/rover-init-starters) • Transform any GraphQL API into AI-accessible tools*