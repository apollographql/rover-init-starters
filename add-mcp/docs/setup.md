# Add Custom Actions for Claude

**Make Claude work with your specific workflows** – from generating reports to updating inventory to checking system health.

## What This Does

Claude will automatically understand your API and can:
- **Query your data** using natural language
- **Perform actions** you define (create, update, delete)
- **Check system status** and health metrics
- **Generate reports** based on your data

**The connector auto-detects your API structure** – no manual schema definition required.

## 📋 What You Need

- **Your API running** (any HTTP API works – REST, GraphQL, whatever)
- **Docker installed** ([get it here](https://docs.docker.com/get-docker/) if needed)
- **5-10 minutes** for setup

## 🚀 Step-by-Step Setup

### Step 1: Add the Connector to Your Project

```bash
# From your API project directory
cd /path/to/your/api/project

# Copy the connector files (one command, works everywhere)
cp -r /path/to/rover-init-starters/add-mcp/* .

# What you just added:
ls -la
# ✅ mcp.Dockerfile    (builds the connector)
# ✅ examples/         (starter actions for common workflows)  
# ✅ tools/            (your custom actions go here)
# ✅ docs/             (this guide and troubleshooting)
```

### Step 2: Point the Connector to Your API

```bash
# Create config file
cp .env.template .env

# Edit .env (takes 30 seconds)
nano .env  # or code .env, whatever you prefer
```

**What to update in `.env`:**
```bash
# Change this line to your API URL
GRAPHQL_ENDPOINT="http://localhost:4000/graphql"  # ← Your API here

# That's it! Everything else auto-detects
```

**Why this works:** The connector auto-detects your API schema, available operations, and data types. You just point it to your endpoint.

### Step 3: Start the Connector

```bash
# Build the connector (uses your familiar Docker commands)
docker build -f mcp.Dockerfile -t my-api-connector .

# Start it (runs in background, always available)  
docker run -d \
  --name my-api-connector \
  -p 5000:5000 \
  --env-file .env \
  my-api-connector

# Verify it's working
curl http://localhost:5000/health
# Should show: {"status": "ok", "api": "connected", "actions": 0}
```

**What just happened:** The connector connected to your API, analyzed its structure, and is now ready to help Claude understand your data and operations.

### Step 4: See What Claude Will See

**Use MCP Inspector to verify everything works before connecting Claude:**

```bash
# Open MCP Inspector in your browser
npx @mcp/inspector --port 5000

# Opens at: http://localhost:3000
```

**What you'll see:**
- All available actions Claude can perform
- Interactive testing forms for each action
- Real responses from your API
- Any error messages if something's wrong

**Try it:**
1. Click on any available action
2. Fill in test parameters (e.g., userId: "123")
3. Click "Execute" 
4. See the exact data Claude will get

**✅ If it works in MCP Inspector, it'll work with Claude.**

## ⚙️ Configuration Options

**Most setups work with just the API URL.** Here are additional options if needed:

### If Your API Requires Authentication

**Bearer token (most common):**
```bash
# Add to .env
AUTH_TOKEN="your-bearer-token-here"
```

**API key:**
```bash
# Add to .env  
API_KEY="your-api-key-here"
```

**Custom header:**
```bash
# Add to .env
AUTH_HEADER_NAME="X-Your-Header"
AUTH_HEADER_VALUE="your-value-here"  
```

**How to test if auth works:**
```bash
# Try this curl command with your auth
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:4000/graphql

# If that works, the connector will work too
```

## 🔧 Create Custom Actions for Your Workflows

**This is where Claude becomes truly useful for your specific needs.**

The connector starts with 0 custom actions. Let's add one for your workflow:

### Example: "Get User Info" Action

**1. Create the action:**
```bash
# Create a new action file
touch tools/GetUserInfo.graphql
```

**2. Define what Claude can do:**
```graphql
# tools/GetUserInfo.graphql
query GetUserInfo($userId: ID!) {
  """
  Get detailed information about a user.
  Claude can use this when you ask: "Show me details for user 123"
  """
  user(id: $userId) {
    id
    name
    email
    createdAt
    lastLoginAt
    profile {
      avatar
      bio
    }
  }
}
```

**3. Test it first (recommended):**
```bash
# Make sure your API responds to this query
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "query($userId:ID!){user(id:$userId){id name email}}", "variables": {"userId": "123"}}'
```

**4. Reload the connector:**
```bash
# Pick up your new action (takes 5 seconds)
docker restart my-api-connector
```

**Now Claude can:** Ask Claude "Show me user 123's profile" and it will use your new action automatically.

### Example: "Get Products" Action (REST API)

**If your API is REST-based,** here's how Claude can query it:

```graphql
# tools/GetProducts.graphql  
query GetProducts($category: String, $limit: Int = 20) {
  """
  Get products from your catalog.
  Claude can use this when you ask: "Show me electronics under $100"
  """
  products(category: $category, limit: $limit)
    @connect(
      http: {
        GET: "/api/v1/products"
        query: { category: "$category", limit: "$limit" }
      }
    ) {
    id
    name
    price
    description
    inStock
  }
}
```

**What this does:** Claude can now ask your REST API for products using natural language like "Show me laptops in stock" or "What electronics are under $200?"

## 📁 What You Just Added to Your Project

```
your-api-project/
├── tools/                  # ← Your custom Claude actions go here
│   └── (empty to start)    # Add .graphql files to give Claude new abilities
├── examples/               # ← Working examples to copy and modify  
│   ├── api/               # REST API patterns
│   ├── aws/               # AWS service patterns  
│   ├── graphql/           # GraphQL patterns
│   └── all/               # Mix of everything
├── docs/                   # ← Guides when you need help
│   ├── setup.md           # This guide
│   ├── testing.md         # "Verify it works"
│   └── troubleshooting.md # "When things break"
├── mcp.Dockerfile         # ← Builds the Claude connector
├── .env                   # ← Your API settings (you created this)
└── README.md              # ← Quick start for your team
```

**What matters most:** 
- **`tools/`** - Add `.graphql` files here to give Claude new abilities
- **`examples/`** - Copy these patterns and modify for your needs
- **`.env`** - Update your API URL here

## 🎯 Common Patterns

### Start with Examples, Modify for Your Needs

**The fastest way to get Claude working with your specific data:**

1. **Copy a similar example:**
   ```bash
   # Copy the closest match to your use case
   cp examples/api/GetProducts.graphql tools/GetMyData.graphql
   ```

2. **Update for your API:**
   ```graphql
   # Change the query to match your data
   query GetMyData($filter: String) {
     """
     Get my specific data that Claude needs.
     Claude uses this when you ask about [your domain].
     """
     myData(filter: $filter) {
       # Your actual fields here
       id
       name
       status
     }
   }
   ```

3. **Restart and test:**
   ```bash
   docker restart my-api-connector
   curl http://localhost:5000/health  # Should show "actions": 1
   ```

**Result:** Claude can now work with your specific data using natural language.

## ✅ You're All Set!

**Claude can now work with your API.** Here's what to do next:

1. **[Verify it works](testing.md)** - Test Claude's connection and add it to Claude Desktop
2. **Create more actions** - Copy examples from `examples/` folder and modify for your workflows  
3. **[Deploy for your team](deploy.md)** - Share this superpower with others
4. **[Quick fixes](troubleshooting.md)** - If something breaks (most fixes take < 2 minutes)

## 💡 Pro Tips

**Hot reloading:** Add new `.graphql` files to `tools/` and restart the connector. No rebuild needed.

**Start simple:** Copy an example from `examples/`, change the field names to match your API, restart the connector.

**Test with curl first:** If your curl command works against your API, the connector will work too.

**Use descriptive comments:** Claude reads the `"""comments"""` in your GraphQL files to understand what each action does.

---

For advanced scenarios and complete technical reference, see the [Complete Guide](../QUICKSTART_MCP.md).