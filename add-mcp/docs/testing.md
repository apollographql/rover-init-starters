# Verify Everything Works

**Quick checks to make sure Claude can access your API and your custom actions work as expected.**

## 🎯 MCP Inspector - See What Claude Will Do

**The visual way to verify everything works before connecting Claude.**

### Why Use MCP Inspector

- **Build confidence** - See exactly what Claude will be able to do with your API
- **Test with real data** - Try your actions with actual parameters from your system
- **Debug instantly** - See error messages and responses in real-time
- **No guesswork** - What works here will work with Claude

### Open MCP Inspector

```bash
# Opens the testing interface in your browser
npx @mcp/inspector --port 5000

# Available at: http://localhost:3000
```

### Try Your Actions

**What you'll see when it opens:**
- **Action list** - All the things Claude can do with your API
- **Test forms** - Fill in parameters and run each action
- **Live results** - See the exact data Claude will get
- **Error details** - Clear messages if something's wrong

**Recommended workflow:**
1. **Pick an action** - Click on one that matches your use case
2. **Add real data** - Use actual IDs, names, etc. from your system
3. **Run it** - Click "Execute" and see the results
4. **Verify** - Does the response look right? This is what Claude will see

**✅ If your actions work in MCP Inspector, Claude will be able to use them successfully.**

## ⚡ Quick Status Check

**Make sure the connector is running and can reach your API:**

```bash
# This should respond instantly
curl http://localhost:5000/health

# ✅ Good response:
# {"status": "ok", "api": "connected", "actions": 1}

# ❌ Bad response: connection refused, timeout, or error message
```

**What each part means:**
- **`status: ok`** → Connector is running  
- **`api: connected`** → Successfully connected to your API
- **`actions: 1`** → Found 1 custom action in your `tools/` folder

## 🐛 If Something's Wrong

**Connection refused?**
```bash
# Check if the connector is running
docker ps | grep connector

# If not running, start it:
docker run -d --name my-api-connector -p 5000:5000 --env-file .env my-api-connector
```

**API not connected?** 
```bash
# Test your API directly
curl http://localhost:4000/graphql  # (or your API URL)

# If that fails, fix your API first, then restart the connector
```

## ⚡ Quick Command Line Tests

**If you prefer the terminal:**

### See What Actions Are Available
```bash
# Lists all your custom actions
curl http://localhost:5000/tools

# Shows: action names, descriptions, and parameters
```

### Test an Action
```bash
# Run one of your actions with test data
curl -X POST http://localhost:5000/execute \
  -H "Content-Type: application/json" \
  -d '{
    "tool": "GetUserInfo", 
    "arguments": {"userId": "123"}
  }'

# Returns: the same data Claude would get
```

**Pro tip:** If this works, Claude can use your action. If it fails, Claude will get the same error.

## 🤖 Add Claude Desktop Access

**Give Claude Desktop access to your API so you can use natural language.**

### Copy the Configuration

**macOS:**
```bash
cp claude-desktop-config.json ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

**Windows:**
```bash
copy claude-desktop-config.json "%APPDATA%\Claude\claude_desktop_config.json"
```

**Linux:**
```bash
cp claude-desktop-config.json ~/.config/Claude/claude_desktop_config.json
```

### Restart Claude Desktop

1. **Quit Claude Desktop completely** (not just close the window)
2. **Start Claude Desktop again**
3. **Look for the hammer icon (🔨)** - means it worked!

### Test with Claude

**Try this conversation:**
```
Hi Claude! What can you help me do with my API?
```

Claude should mention your custom actions.

**Test a specific action:**
```
Claude, can you show me user 123's information?
```

Claude will use your `GetUserInfo` action (or whatever you named it) automatically.

**🎉 Success!** Claude can now work with your API using natural conversation.

## ❌ When Things Don't Work

**Most issues have 30-second fixes:**

### "Connection refused" Error

```bash
# Is your API running?
curl http://localhost:4000  # (or your API URL)

# If API is running but connector can't reach it:
# Edit .env and change to the full URL:
GRAPHQL_ENDPOINT="http://localhost:4000/graphql"  # not just "/graphql"

# Restart connector:
docker restart my-api-connector
```

### "No actions found"  

```bash
# Do you have .graphql files in tools/?
ls -la tools/

# If empty, copy an example:
cp examples/api/GetProducts.graphql tools/MyFirstAction.graphql

# Restart connector:
docker restart my-api-connector
```

### "Authentication failed"

```bash
# Test if your API auth works:
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:4000/graphql

# If that works, add to .env:
AUTH_TOKEN="YOUR_TOKEN"

# Restart connector:
docker restart my-api-connector
```

### "Claude Desktop not connecting"

```bash
# Is the connector running?
curl http://localhost:5000/health

# Did you restart Claude Desktop completely?
# Quit → Start → Look for hammer icon (🔨)
```

**Still stuck?** Check the [full troubleshooting guide](troubleshooting.md) for detailed fixes.

## ✅ Next Steps

**After verifying everything works:**

1. **Create more custom actions** - Copy examples from `examples/` and modify for your workflows
2. **[Deploy for your team](deploy.md)** - Share this with other developers  
3. **Start using Claude** - Ask Claude to help with your daily API tasks

**Claude can now:**
- Query your data using natural language
- Perform actions you define  
- Help you understand your API responses
- Generate reports from your data

---

**Need help?** Most issues are covered in the [troubleshooting guide](troubleshooting.md).

