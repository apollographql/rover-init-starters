# Quick Fixes (< 2 Minutes Each)

**When things break, here's how to fix them fast.**

## 🚨 "Connection refused" Error

**What you see:**
```bash
curl http://localhost:5000/health
# curl: (7) Connection refused
```

**Quick diagnosis:**
```bash
# Step 1: Is the connector running?
docker ps | grep connector
# ✅ Should show: my-api-connector ... Up 2 minutes

# Step 2: Is your API reachable?
curl http://localhost:4000  # Use your actual API URL
# ✅ Should respond (not connection refused)
```

**Fixes (try in order):**

1. **Connector not running:**
   ```bash
   docker run -d --name my-api-connector -p 5000:5000 --env-file .env my-api-connector
   ```

2. **API not reachable:**
   ```bash
   # Edit .env with full URL:
   GRAPHQL_ENDPOINT="http://localhost:4000/graphql"
   # Restart: docker restart my-api-connector
   ```

3. **Docker networking issue:**
   ```bash
   # Edit .env:
   GRAPHQL_ENDPOINT="http://host.docker.internal:4000/graphql"  # macOS/Windows
   GRAPHQL_ENDPOINT="http://172.17.0.1:4000/graphql"           # Linux
   # Restart: docker restart my-api-connector
   ```

## 🔨 "No hammer icon in Claude Desktop"

**What you see:** Claude Desktop opens normally but no hammer icon (🔨) appears.

**Quick diagnosis:**
```bash
# Step 1: Is connector running?
curl http://localhost:5000/health
# ✅ Should respond with: {"status": "ok", "api": "connected", "actions": 1}

# Step 2: Config file exists?
ls -la ~/Library/Application\ Support/Claude/claude_desktop_config.json  # macOS
# ✅ Should exist and show recent timestamp
```

**Fixes (try in order):**

1. **Copy config again:**
   ```bash
   cp claude-desktop-config.json ~/Library/Application\ Support/Claude/claude_desktop_config.json
   ```

2. **Restart Claude Desktop completely:**
   ```bash
   # Quit Claude (⌘+Q), then reopen
   # Look for hammer icon (🔨) on restart
   ```

3. **Check Claude Desktop logs:**
   ```bash
   tail -f ~/Library/Logs/Claude/mcp*.log
   # Look for connection errors
   ```

## ❌ "Claude says 'no actions found'"

**What you see:** Hammer icon exists but Claude says it has no tools available.

**Quick diagnosis:**
```bash
# Do you have .graphql files in tools/?
ls -la tools/
# ✅ Should show: GetUserInfo.graphql (or similar)

# Are they valid?
curl http://localhost:5000/tools
# ✅ Should list your actions
```

**Fixes:**

1. **No files in tools/:**
   ```bash
   cp examples/api/GetProducts.graphql tools/MyFirstAction.graphql
   docker restart my-api-connector
   ```

2. **Invalid GraphQL syntax:**
   ```bash
   # Check for syntax errors:
   docker logs my-api-connector | grep -i error
   # Fix the .graphql file and restart
   ```

## 🔐 "Authentication failed"

**What you see:**
```bash
curl http://localhost:5000/health
# {"status": "ok", "api": "authentication_failed", "actions": 0}
```

**Quick diagnosis:**
```bash
# Does your API require auth?
curl http://localhost:4000/graphql
# If you get "401 Unauthorized" or similar, yes it does

# Test your auth manually:
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:4000/graphql
# ✅ Should work without 401 error
```

**Fixes:**

1. **Add auth to .env:**
   ```bash
   # Edit .env and add:
   AUTH_TOKEN="your-working-token-here"
   
   # Restart:
   docker restart my-api-connector
   ```

2. **API key instead:**
   ```bash
   # Edit .env and add:
   API_KEY="your-api-key-here"
   
   # Restart:
   docker restart my-api-connector
   ```

3. **Custom header:**
   ```bash
   # Edit .env and add:
   AUTH_HEADER_NAME="X-Your-Header"
   AUTH_HEADER_VALUE="your-value"
   
   # Restart:
   docker restart my-api-connector
   ```

## 🔍 Use MCP Inspector to Debug

**When the quick fixes don't work, see exactly what's happening:**

```bash
# Open the visual debugger
npx @mcp/inspector --port 5000

# Opens at: http://localhost:3000
```

**What MCP Inspector shows you:**
- ✅ **Actions found** - If empty list, you need .graphql files in tools/
- ✅ **API connection** - Green = connected, Red = connection issues
- ✅ **Real responses** - Click "Execute" on any action to test with your API  
- ❌ **Error details** - Clear explanations when things break
- 🔧 **What to fix** - Specific guidance for common issues

**Common debugging scenarios:**
- **Empty action list** → Add .graphql files to tools/, restart connector
- **Connection errors** → Check your API URL in .env
- **Auth failures** → Verify your tokens in .env
- **Bad responses** → Your API might be returning different data than expected

**Pro tip:** If an action works in MCP Inspector but Claude can't use it, restart Claude Desktop completely.

## ⚠️ "Still having issues?"

**Nuclear option (works 95% of the time):**

```bash
# Stop everything
docker stop my-api-connector
docker rm my-api-connector

# Start fresh
docker build -f mcp.Dockerfile -t my-api-connector .
docker run -d --name my-api-connector -p 5000:5000 --env-file .env my-api-connector

# Test
curl http://localhost:5000/health
```

## 📞 When You're Really Stuck

**Before asking for help:**

1. **Try the nuclear option above** ☝️
2. **Check these logs:**
   ```bash
   docker logs my-api-connector --tail 20
   ```
3. **Verify your API works independently:**
   ```bash
   curl http://localhost:4000/graphql  # Should respond
   ```

**What to share if you need help:**
- Error message you're seeing
- Output of `curl http://localhost:5000/health`
- Output of `docker logs my-api-connector --tail 20`
- Your `.env` file (remove any secrets first)

**Resources:**
- 📚 [Complete technical guide](../QUICKSTART_MCP.md)
- 🔧 [Setup guide](setup.md) 
- 🧪 [Testing guide](testing.md)

---

**🏃‍♂️ 90% of issues are fixed by:**
1. Restarting the connector: `docker restart my-api-connector`
2. Checking your API is running: `curl http://localhost:4000`
3. Using the full URL in .env: `GRAPHQL_ENDPOINT="http://localhost:4000/graphql"`