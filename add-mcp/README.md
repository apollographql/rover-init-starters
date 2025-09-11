# Get Claude to Work with Your API

**Give Claude instant access to your data and services in 5 minutes.** No GraphQL knowledge required.

## ⚡ What You'll Get

Claude will be able to:
- **Query your data** ("Show me users from last week")
- **Trigger actions** ("Create a new order for customer X") 
- **Check status** ("Is the payment service healthy?")
- **Analyze trends** ("Compare this month's metrics to last month")

All through natural conversation, using your existing data.

## 🚀 Quick Start

**Step 1: Add to your project**
```bash
# From your API project directory
cp -r /path/to/rover-init-starters/add-mcp/* .
```

**Step 2: Point to your API**
```bash
# Create config file
cp .env.template .env

# Edit .env and update this line:
GRAPHQL_ENDPOINT="http://localhost:4000"  # Your API URL
```

**Step 3: Start the connector** 
```bash
# Using Docker (works everywhere)
docker build -f mcp.Dockerfile -t my-api-connector .
docker run --env-file .env -p 5000:5000 my-api-connector
```

**Step 4: See what Claude will see**
```bash
# Open the MCP Inspector in your browser
npx @mcp/inspector --port 5000

# Opens at: http://localhost:3000
```

**What you'll see:**
- All the actions Claude can perform with your API
- Interactive forms to test each action with real data
- Exact responses Claude will get from your API

**Try it:** Click on an action, fill in test data, hit "Run" - if it works here, it'll work with Claude.

**🎉 Done!** Claude can now talk to your API using natural language.

## 📖 Next Steps

**Want Claude to do more with your API?**

- **📚 [Add Custom Actions](docs/setup.md)** - Create tools for your specific workflows ("generate reports", "update inventory", etc.)
- **🧪 [Verify Everything Works](docs/testing.md)** - Test Claude's access and add Claude Desktop integration  
- **🚀 [Deploy for Your Team](docs/deploy.md)** - Share this superpower with your entire team
- **🔧 [When Things Break](docs/troubleshooting.md)** - Quick fixes for common setup issues

## 📋 What You Need

- Any API that responds to HTTP requests (REST, GraphQL, anything)
- Docker installed (if you don't have it: [get Docker](https://docs.docker.com/get-docker/))
- 5 minutes

## ❓ Common Questions

**"Will this work with my [REST/GraphQL/custom] API?"** → Yes, if it responds to HTTP requests, it'll work.

**"Do I need to know GraphQL?"** → Nope. The template handles all the GraphQL stuff automatically.

**"Is this secure?"** → Claude connects to your local copy only. Your data stays on your machine.

## 🆘 Need Help?

- **Something broken?** → [Quick fixes](docs/troubleshooting.md) (most issues take < 2 minutes to fix)
- **Want to understand more?** → [Complete technical guide](QUICKSTART_MCP.md)
- **Want examples?** → Check the `examples/` folder for REST, AWS, and GraphQL patterns

---

*Transform any API into Claude-accessible tools • Part of [Apollo Rover Init Starters](https://github.com/apollographql/rover-init-starters)*