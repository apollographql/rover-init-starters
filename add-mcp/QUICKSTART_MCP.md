# Apollo MCP Server Quickstart Guide

**Transform your GraphQL API into AI-accessible tools in under 5 minutes!**

This guide shows you how to add Apollo MCP (Model Context Protocol) Server capabilities to any existing GraphQL project, making your API accessible to AI assistants like Claude.

## 🚀 What You'll Get

- **AI-Powered API Access**: Let Claude execute GraphQL queries and mutations against your API
- **Zero Code Changes**: Works with existing GraphQL APIs without modification
- **Rich Tool Library**: Convert GraphQL operations into callable AI tools
- **Enterprise Ready**: Built-in authentication, rate limiting, and monitoring
- **Development Friendly**: Hot reload, debugging, and testing tools included

---

## 📋 Prerequisites

- **Existing GraphQL API** (running on any port)
- **Docker** installed on your machine
- **Node.js 18+** (for CLI tools and testing)
- **Claude Desktop** (optional, for AI assistant integration)

---

## ⚡ Quick Start (5 Minutes)

### Step 1: Copy MCP Template Files

Copy all files from this `add-mcp/` directory to your existing GraphQL project root:

```bash
# Navigate to your GraphQL project
cd /path/to/your/graphql/project

# Copy MCP template files
cp -r /path/to/rover-init-starters/add-mcp/* .

# Verify files were copied
ls -la
# You should see: .apollo/, tools/, mcp.Dockerfile, .env.template, etc.
```

### Step 2: Configure Environment

```bash
# Create your environment configuration
cp .env.template .env

# Edit .env with your actual values
nano .env  # or use your preferred editor
```

**Required Configuration:**
```bash
# Update these in your .env file
PROJECT_NAME="your-project-name"
GRAPHQL_ENDPOINT="http://localhost:4000/graphql"  # Your GraphQL endpoint
```

### Step 3: Start MCP Server

**Option A: Docker (Recommended)**
```bash
# Build MCP server image
docker build -f mcp.Dockerfile -t your-project-mcp .

# Start MCP server
docker run -d \
  --name your-project-mcp \
  -p 5000:5000 \
  --env-file .env \
  your-project-mcp

# Check if it's running
docker ps
```

**Option B: Rover CLI** (Alternative method)
```bash
# Install Rover CLI if not already installed
curl -sSL https://rover.apollo.dev/nix/latest | sh

# Start MCP server using Rover
rover mcp start --config .apollo/mcp.local.yaml
```

### Step 4: Test Your MCP Server

```bash
# Test with MCP Inspector (opens browser interface)
npx @mcp/inspector --port 5000

# Or test with curl
curl http://localhost:5000/health
```

### Step 5: Connect Claude Desktop

Copy the generated configuration to Claude Desktop:

```bash
# The claude-desktop-config.json file contains the configuration
# Copy its contents to your Claude Desktop configuration
```

**🎉 Done!** Your GraphQL API is now accessible to AI assistants!

---

## 🚀 Extending Your MCP Server

Your MCP server includes example tools based on your selection. Each `.graphql` file in the `/tools` directory becomes a tool that Claude can use.

### Understanding Your Examples

Based on your data source selection, you received examples for:

- **External APIs**: REST endpoints, webhooks, and SaaS integrations
- **AWS Services**: Lambda, DynamoDB, CloudWatch, and S3 examples
- **GraphQL APIs**: Queries, mutations, and federated graph patterns
- **All Sources**: A mix of examples from each category

### Adding More Data Sources

#### 🗄️ Databases (PostgreSQL, MySQL, MongoDB)
While direct database connectors are coming soon, you can connect today by:
1. Creating a REST API wrapper for your database
2. Using AWS Lambda to query your database
3. Using a GraphQL API in front of your database

Example pattern:
```graphql
query GetDatabaseRecords($table: String!) {
  records @connect(
    http: {
      POST: "your-database-api-endpoint"
      body: { table: "{{$table}}" }
    }
  ) {
    id
    data
  }
}
```

#### 📁 File Systems & Documents

Connect to documents through:
- S3 or cloud storage APIs
- Document processing services
- Custom file API endpoints

#### 💬 Communication Platforms

Most communication tools offer REST APIs:
- Slack: Use webhook URLs or Slack API
- Discord: REST API with bot tokens
- Email: SMTP services with API wrappers

### Customizing Your Tools

1. **Update Endpoints**: Replace example URLs with your actual endpoints
2. **Add Authentication**: Include necessary headers and tokens
3. **Modify Fields**: Adjust query/mutation fields to match your schema
4. **Test Locally**: Use MCP Inspector to verify your tools work correctly

### Resources

- [Apollo Connectors Documentation](https://apollographql.com/docs/connectors)
- [MCP Server Examples](https://github.com/modelcontextprotocol/servers)
- [Custom Connector Guide](https://apollographql.com/docs/connectors/custom)
- [Apollo Federation](https://apollographql.com/docs/federation)

---

## 🔧 Detailed Setup Guide

### Project Structure After Setup

```
your-graphql-project/
├── .apollo/
│   ├── mcp.local.yaml      # Local development config
│   └── mcp.staging.yaml    # Staging/production config
├── tools/
│   └── ExampleQuery.graphql # Your GraphQL tools (edit these!)
├── .vscode/
│   └── settings.json       # VS Code GraphQL support
├── mcp.Dockerfile          # Docker configuration
├── .env.template           # Environment template
├── .env                    # Your environment (create this)
├── claude-desktop-config.json # Claude Desktop integration
└── QUICKSTART_MCP.md       # This guide
```

### Environment Configuration Details

Edit your `.env` file with these essential settings:

```bash
# === PROJECT BASICS ===
PROJECT_NAME="my-awesome-api"
GRAPHQL_ENDPOINT="http://localhost:4000/graphql"

# === APOLLO CREDENTIALS ===
# Get from: https://studio.apollographql.com/user-settings/api-keys
APOLLO_API_KEY="service:my-awesome-api:YOUR_API_KEY_HERE"
APOLLO_GRAPH_REF="my-awesome-api@current"

# === PORTS ===
MCP_PORT=5000              # MCP server listens here
GRAPHQL_PORT=4000          # Your GraphQL server port

# === SECURITY (Important for production!) ===
RATE_LIMIT_REQUESTS_PER_MINUTE=60
MAX_QUERY_COMPLEXITY=1000
LOG_LEVEL="debug"          # Use "info" for production
```

### Authentication Setup

If your GraphQL endpoint requires authentication:

```bash
# Bearer token authentication
AUTH_TOKEN="your-bearer-token-here"

# Or API key authentication  
API_KEY="your-api-key-here"

# Or custom headers
AUTH_HEADER_NAME="X-API-Key"
AUTH_HEADER_VALUE="your-custom-auth-value"
```

---

## 🛠️ Creating GraphQL Tools

### Understanding Tools

Each `.graphql` file in the `tools/` directory becomes an AI tool. The AI assistant can call these tools with parameters.

### Example Tool Creation

**1. Create a new tool file:**
```bash
# Create a user query tool
touch tools/GetUserProfile.graphql
```

**2. Add your GraphQL operation:**
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

**3. Test the operation first:**
```bash
# Test in GraphQL Playground or with curl
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "query GetUserProfile($userId: ID!) { user(id: $userId) { id name email } }", "variables": {"userId": "123"}}'
```

**4. Restart MCP server to pick up new tools:**
```bash
docker restart your-project-mcp
```

### Tools for REST Connector Projects

If you're using Apollo Connectors (REST integration), your tools can use `@connect` directives:

```graphql
# tools/GetProducts.graphql
query GetProducts($category: String, $limit: Int = 20) {
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
  }
}
```

### Best Practices for Tools

1. **Descriptive Names**: `GetUserProfile`, `CreateBlogPost`, `UpdateOrderStatus`
2. **Comprehensive Fields**: Include all data AI might need
3. **Error Handling**: Always include error fields in mutations
4. **Documentation**: Use GraphQL comments to explain complex operations
5. **Variables**: Provide sensible defaults for optional parameters

---

## 🧪 Testing Your MCP Server

### Method 1: MCP Inspector (Visual Interface)

The MCP Inspector provides a web interface to test your tools:

```bash
# Start the inspector (opens in browser)
npx @mcp/inspector --port 5000

# You can now:
# - See all available tools
# - Test tools with different parameters
# - View GraphQL schema introspection
# - Debug tool execution
```

### Method 2: Command Line Testing

```bash
# Check server health
curl http://localhost:5000/health

# List available tools
curl http://localhost:5000/tools

# Execute a tool (replace with your actual tool)
curl -X POST http://localhost:5000/execute \
  -H "Content-Type: application/json" \
  -d '{"tool": "GetUserProfile", "arguments": {"userId": "123"}}'
```

### Method 3: Claude Desktop Integration

After setting up Claude Desktop (see next section), you can test directly in Claude:

```
Claude, can you get the profile for user ID 123?
```

Claude will automatically use your `GetUserProfile` tool!

---

## 🤖 Claude Desktop Integration

### Step 1: Copy Configuration

The `claude-desktop-config.json` file contains the MCP server configuration for Claude Desktop.

**On macOS:**
```bash
# Copy to Claude Desktop configuration
cp claude-desktop-config.json ~/Library/Application\ Support/Claude/claude_desktop_config.json

# Or merge if you have existing servers
# (Edit the file manually to add the MCP server entry)
```

**On Windows:**
```bash
# Copy to Claude Desktop configuration  
copy claude-desktop-config.json "%APPDATA%\Claude\claude_desktop_config.json"
```

**On Linux:**
```bash
# Copy to Claude Desktop configuration
cp claude-desktop-config.json ~/.config/Claude/claude_desktop_config.json
```

### Step 2: Restart Claude Desktop

After copying the configuration:
1. Completely quit Claude Desktop
2. Restart Claude Desktop
3. You should see a hammer icon (🔨) indicating MCP tools are loaded

### Step 3: Test Integration

Start a conversation with Claude and try:

```
Hi Claude! Can you help me query my GraphQL API? 
What tools do you have available?
```

Claude should respond with a list of your GraphQL tools!

### Troubleshooting Claude Integration

**Issue: No hammer icon in Claude Desktop**
```bash
# Check MCP server is running
curl http://localhost:5000/health

# Verify configuration file syntax
cat ~/Library/Application\ Support/Claude/claude_desktop_config.json | jq .

# Check Claude Desktop logs (macOS)
tail -f ~/Library/Logs/Claude/mcp*.log
```

**Issue: Connection refused**
- Ensure MCP server is running on port 5000
- Check firewall settings
- Verify localhost access

---

## 🚀 Deployment Options

### Docker Compose (Recommended for Production)

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  # Your existing GraphQL server
  graphql-api:
    build: .
    ports:
      - "4000:4000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - NODE_ENV=production

  # Apollo MCP Server
  mcp-server:
    build:
      context: .
      dockerfile: mcp.Dockerfile
    ports:
      - "5000:5000"
    environment:
      - GRAPHQL_ENDPOINT=http://graphql-api:4000/graphql
      - APOLLO_API_KEY=${APOLLO_API_KEY}
      - NODE_ENV=production
    env_file:
      - .env
    depends_on:
      - graphql-api
    restart: unless-stopped
    volumes:
      - ./tools:/app/tools:ro
      - ./.apollo:/app/.apollo:ro
```

Start with:
```bash
docker-compose up -d
```

### Kubernetes Deployment

Create `k8s-mcp-deployment.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: apollo-mcp-server
spec:
  replicas: 2
  selector:
    matchLabels:
      app: apollo-mcp-server
  template:
    metadata:
      labels:
        app: apollo-mcp-server
    spec:
      containers:
      - name: mcp-server
        image: your-project-mcp:latest
        ports:
        - containerPort: 5000
        env:
        - name: GRAPHQL_ENDPOINT
          value: "http://graphql-service:4000/graphql"
        - name: APOLLO_API_KEY
          valueFrom:
            secretKeyRef:
              name: apollo-credentials
              key: api-key
        resources:
          requests:
            memory: "256Mi"
            cpu: "100m"
          limits:
            memory: "512Mi"
            cpu: "500m"
---
apiVersion: v1
kind: Service
metadata:
  name: apollo-mcp-service
spec:
  selector:
    app: apollo-mcp-server
  ports:
    - protocol: TCP
      port: 5000
      targetPort: 5000
  type: LoadBalancer
```

### Cloud Deployment

**Render (Easy Deploy):**
```bash
# Connect your GitHub repo to Render
# Use mcp.Dockerfile as the dockerfile
# Set environment variables in Render dashboard
```

**Railway:**
```bash
# Connect your GitHub repo to Railway  
# Railway will auto-detect mcp.Dockerfile
# Configure environment variables in Railway dashboard
```

**AWS ECS/Fargate:**
- Use the provided Dockerfile
- Configure task definition with environment variables
- Set up load balancer for port 5000

---

## 🔍 Monitoring and Debugging

### Logging

**View MCP server logs:**
```bash
# Docker logs
docker logs your-project-mcp -f

# Or if using docker-compose
docker-compose logs mcp-server -f
```

**Log levels in `.env`:**
```bash
LOG_LEVEL="debug"    # Verbose logging
LOG_LEVEL="info"     # Normal logging  
LOG_LEVEL="warn"     # Warnings only
LOG_LEVEL="error"    # Errors only
```

### Health Checks

**Built-in health endpoint:**
```bash
curl http://localhost:5000/health

# Response should be:
# {"status": "ok", "graphql": "connected", "tools": 3}
```

**Comprehensive status check:**
```bash
curl http://localhost:5000/status
```

### Performance Monitoring

**Enable metrics (in `.env`):**
```bash
METRICS_ENABLED="true"
```

**View metrics:**
```bash
curl http://localhost:5000/metrics
```

### Debug Mode

**Enable debug mode:**
```bash
# In .env
DEBUG_COMPONENTS="server,tools,graphql"
LOG_OPERATIONS="true"
LOG_TIMING="true"
```

---

## 🛠️ Development Workflow

### Hot Reloading Tools

The MCP server automatically reloads when you modify GraphQL tool files:

```bash
# 1. Edit a tool file
nano tools/GetUserProfile.graphql

# 2. Save the file
# 3. MCP server automatically detects changes and reloads
# 4. Test immediately with MCP Inspector
```

### IDE Integration

**VS Code Setup:**
The included `.vscode/settings.json` provides:
- GraphQL syntax highlighting
- Schema validation
- Auto-completion for GraphQL operations

**GraphQL LSP:**
```bash
# Install GraphQL Language Server
npm install -g @graphql-lsp/server

# VS Code will automatically use it with the included settings
```

### Testing Workflow

**Recommended development cycle:**

1. **Write GraphQL Operation**: Create/edit `.graphql` files in `tools/`
2. **Test in GraphQL Playground**: Verify operation works against your API
3. **Test MCP Tool**: Use MCP Inspector to test the tool
4. **Test with Claude**: Try the tool in Claude Desktop
5. **Deploy**: Push changes and restart production MCP server

---

## 🔒 Security Best Practices

### Production Configuration

**Update `.env` for production:**
```bash
NODE_ENV="production"
LOG_LEVEL="info"
EXPOSE_ERROR_DETAILS="false"
DEVELOPMENT_MODE="false"
HOT_RELOAD="false"
PLAYGROUND_ENABLED="false"
```

### Rate Limiting

```bash
# Configure in .env
RATE_LIMIT_REQUESTS_PER_MINUTE=30  # Lower for production
RATE_LIMIT_BURST_SIZE=5
```

### Query Security

```bash
# Prevent complex/malicious queries
MAX_QUERY_COMPLEXITY=750
MAX_QUERY_DEPTH=12
MAX_REQUEST_SIZE=10485760  # 10MB
```

### Authentication

**For production APIs:**
```bash
# Use strong authentication
AUTH_TOKEN="your-secure-production-token"

# Or API key with proper scoping
API_KEY="prod_key_with_limited_scope"
```

### Network Security

**Docker network isolation:**
```yaml
# In docker-compose.yml
networks:
  internal:
    driver: bridge

services:
  mcp-server:
    networks:
      - internal
```

**Firewall rules:**
```bash
# Only allow connections from specific IPs
# Configure in your cloud provider or firewall
```

---

## 🐛 Troubleshooting

### Common Issues

#### ❌ "Connection refused to GraphQL endpoint"

**Problem**: MCP server can't connect to your GraphQL API

**Solutions:**
```bash
# Check if GraphQL server is running
curl http://localhost:4000/graphql

# If using Docker, use container networking
GRAPHQL_ENDPOINT="http://host.docker.internal:4000/graphql"  # macOS/Windows
GRAPHQL_ENDPOINT="http://172.17.0.1:4000/graphql"           # Linux

# Or run MCP server on host network
docker run --network="host" your-project-mcp
```

#### ❌ "No tools found" 

**Problem**: MCP server can't find your GraphQL operations

**Solutions:**
```bash
# Check tools directory exists and has .graphql files
ls -la tools/
ls -la tools/*.graphql

# Verify GraphQL syntax
npx graphql-cli validate tools/*.graphql --schema http://localhost:4000/graphql

# Check MCP server logs
docker logs your-project-mcp
```

#### ❌ "Authentication failed"

**Problem**: GraphQL endpoint requires authentication but MCP server can't authenticate

**Solutions:**
```bash
# Test authentication manually
curl -X POST http://localhost:4000/graphql \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"query": "{ __typename }"}'

# Add authentication to .env
AUTH_TOKEN="YOUR_WORKING_TOKEN"

# Or configure custom headers
AUTH_HEADER_NAME="X-API-Key"
AUTH_HEADER_VALUE="YOUR_API_KEY"
```

#### ❌ "Claude Desktop not connecting"

**Problem**: Claude Desktop can't connect to MCP server

**Solutions:**
```bash
# Check MCP server is accessible
curl http://localhost:5000/health

# Verify Claude Desktop config file location and syntax
cat ~/Library/Application\ Support/Claude/claude_desktop_config.json | jq .

# Check Claude Desktop logs (macOS)
tail -f ~/Library/Logs/Claude/mcp*.log

# Restart Claude Desktop completely
pkill Claude && open -a Claude
```

#### ❌ "GraphQL introspection failed"

**Problem**: MCP server can't introspect your GraphQL schema

**Solutions:**
```bash
# Check if introspection is enabled on your GraphQL server
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ __schema { types { name } } }"}'

# Enable introspection in your GraphQL server (development only!)
# Apollo Server example:
const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: true,  // Add this line
});
```

### Performance Issues

#### ⚠️ "Slow GraphQL responses"

**Solutions:**
```bash
# Enable connection pooling
MAX_CONNECTIONS=20
IDLE_TIMEOUT=60000

# Enable caching (careful with mutations!)
CACHE_ENABLED="true"
CACHE_TTL=300
CACHE_QUERIES_ONLY="true"

# Monitor with timing logs
LOG_TIMING="true"
```

#### ⚠️ "High memory usage"

**Solutions:**
```bash
# Limit query complexity
MAX_QUERY_COMPLEXITY=500
MAX_QUERY_DEPTH=10

# Set resource limits in Docker
docker run --memory="512m" --cpus="0.5" your-project-mcp
```

### Debugging Commands

**Comprehensive diagnostics:**
```bash
#!/bin/bash
# debug-mcp.sh - Run this script to diagnose MCP issues

echo "=== MCP Server Diagnostics ==="

echo "1. Checking if MCP server is running..."
curl -s http://localhost:5000/health || echo "❌ MCP server not responding"

echo "2. Checking GraphQL endpoint..."
curl -s -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ __typename }"}' || echo "❌ GraphQL endpoint not responding"

echo "3. Checking tools directory..."
ls -la tools/*.graphql || echo "❌ No GraphQL tools found"

echo "4. Checking configuration..."
[ -f .env ] && echo "✅ .env file exists" || echo "❌ .env file missing"
[ -f .apollo/mcp.local.yaml ] && echo "✅ MCP config exists" || echo "❌ MCP config missing"

echo "5. Checking Docker container..."
docker ps | grep mcp || echo "❌ MCP Docker container not running"

echo "6. Recent MCP server logs..."
docker logs your-project-mcp --tail 20

echo "=== End Diagnostics ==="
```

---

## 📚 Advanced Usage

### Custom Authentication

For complex authentication scenarios:

```javascript
// custom-auth.js (mount as volume in Docker)
module.exports = {
  async authenticate(context) {
    // Custom authentication logic
    const token = await getTokenFromService();
    return {
      'Authorization': `Bearer ${token}`,
      'X-Custom-Header': 'value'
    };
  }
};
```

### Multiple GraphQL Endpoints

Configure multiple APIs in `.apollo/mcp.local.yaml`:

```yaml
graphql:
  endpoints:
    - name: "users"
      endpoint: "http://localhost:4000/graphql"
      tools_directory: "./tools/users"
    - name: "products" 
      endpoint: "http://localhost:4001/graphql"
      tools_directory: "./tools/products"
```

### Custom Tool Transformations

Transform GraphQL responses before sending to AI:

```yaml
# In MCP config
tools:
  transformations:
    enabled: true
    # Remove sensitive fields
    exclude_fields: ["password", "secret", "token"]
    # Limit array sizes
    max_array_size: 100
```

### Integration with CI/CD

**GitHub Actions example:**

```yaml
# .github/workflows/deploy-mcp.yml
name: Deploy MCP Server

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    
    - name: Build MCP Server
      run: docker build -f mcp.Dockerfile -t ${{ secrets.REGISTRY }}/mcp-server:${{ github.sha }} .
    
    - name: Test MCP Server
      run: |
        docker run -d --name test-mcp -p 5000:5000 \
          -e GRAPHQL_ENDPOINT=http://localhost:4000/graphql \
          ${{ secrets.REGISTRY }}/mcp-server:${{ github.sha }}
        npx @mcp/inspector --port 5000 --test
        
    - name: Deploy to production
      run: |
        # Your deployment commands here
```

---

## 🤝 Contributing and Feedback

### Found an Issue?

1. Check the troubleshooting section above
2. Search existing issues in the Apollo MCP Server repository
3. Create a detailed issue with:
   - Your GraphQL schema structure
   - MCP server logs
   - Steps to reproduce

### Feature Requests

We'd love to hear how you're using Apollo MCP Server! Consider sharing:

- New tool patterns you've discovered
- Integration ideas with other AI assistants
- Performance optimizations
- Security enhancements

---

## 📖 Additional Resources

### Documentation
- **Apollo MCP Server**: [GitHub Repository](https://github.com/apollographql/apollo-mcp-server)
- **Model Context Protocol**: [Official Specification](https://modelcontextprotocol.io/)
- **Apollo Federation**: [Documentation](https://www.apollographql.com/docs/federation/)
- **Apollo Connectors**: [REST Integration Guide](https://www.apollographql.com/docs/graphos/connectors/)

### Community
- **Apollo GraphQL Discord**: Join the #mcp-server channel
- **MCP Community**: [GitHub Discussions](https://github.com/modelcontextprotocol/spec/discussions)
- **GraphQL Community**: [GraphQL Discord](https://discord.graphql.org/)

### Examples and Templates
- **Example Projects**: [Apollo MCP Examples](https://github.com/apollographql/mcp-examples)
- **Community Tools**: [Awesome MCP](https://github.com/punkpeye/awesome-mcp)

---

**🎉 Congratulations!** You've successfully added Apollo MCP Server capabilities to your GraphQL API. Your API is now accessible to AI assistants, opening up new possibilities for intelligent interactions with your data.

**Next Steps:**
1. Create more GraphQL tools specific to your use case
2. Explore Claude Desktop's capabilities with your new tools  
3. Consider deploying to production for team-wide AI access
4. Share your experience with the community!

---

*Need help? Check the troubleshooting section above or reach out to the Apollo GraphQL community.*