# Get Started

This feature is in [preview](https://www.apollographql.com/docs/graphos/resources/feature-launch-stages#preview). Your questions and feedback are highly valued—don't hesitate to get in touch with your Apollo contact or post in the [Apollo Community MCP Server Category](https://community.apollographql.com/c/mcp-server/41).

Let's run Apollo MCP Server for the first time! You will:

* Understand an MCP Server example
* Run an MCP Server example
* Connect an MCP client (Claude Desktop) to the MCP Server

Want a quick overview of what we can do with Apollo MCP Server? Check out [this YouTube video](https://www.youtube.com/watch?v=QTvMYUP4E30) or [blog post](https://www.apollographql.com/blog/getting-started-with-apollo-mcp-server-for-any-graphql-api) about what we'll cover in more detail here.

## What You'll Build

In this quickstart, you'll create a working AI integration where Claude Desktop can query space-related data through GraphQL. By the end, you'll be able to:

* Ask Claude natural questions like "Who are the astronauts currently in space?" or "What rocket launches are coming up?"
* See Claude use MCP tools to fetch real-time data from The Space Devs API
* Understand how GraphQL operations become AI-accessible tools

Here's what the end result looks like:

> **You**: "Tell me about the astronauts currently in space"
> **Claude**: *\[Uses GetAstronautsCurrentlyInSpace tool]* "There are currently 7 astronauts aboard the International Space Station..."

This example uses a pre-built space API, but the same approach works with any GraphQL API - including your own production services.

If you learn best with videos and exercises, this [interactive course](https://www.apollographql.com/tutorials/intro-mcp-graphql) teaches you how to set up Apollo MCP Server and create tools from GraphQL operations.

## Prerequisites

* Clone the [Apollo MCP Server repo](https://github.com/apollographql/apollo-mcp-server)
  ```sh
  git clone https://github.com/apollographql/apollo-mcp-server.git
  ```
* Install [Apollo Rover CLI](https://www.apollographql.com/docs/rover/getting-started) v0.35 or later

## Step 1: Understand the Example

This guide uses an MCP example from the Apollo MCP Server repo. The example uses APIs from [The Space Devs](https://thespacedevs.com/), and it defines a federated graph and the GraphQL operations of the graph to expose as MCP tools.

The example files located in `graphql/TheSpaceDevs/` include:

* **A federated graph** connecting to The Space Devs API
  * `supergraph.yaml` is a [supergraph configuration file](https://www.apollographql.com/docs/rover/commands/supergraphs#yaml-configuration-file) used by the Rover CLI
* **4 pre-built operations** that become your AI tools:
  * `ExploreCelestialBodies` - Search planets, moons, and stars
  * `GetAstronautDetails` - Get info about specific astronauts
  * `GetAstronautsCurrentlyInSpace` - See who's in space right now
  * `SearchUpcomingLaunches` - Find upcoming rocket launches

## Step 2: Run the MCP Server

You can run the MCP Server using the Rover CLI or Docker.

> **Note**: We recommend using Docker if you typically use it in your developer workflow. Otherwise, use Rover.

### Run with Rover

1. From the root directory of your local repo, run `rover dev` to start a local graph with an MCP Server:

   ```sh
   rover dev --supergraph-config ./graphql/TheSpaceDevs/supergraph.yaml \
   --mcp ./graphql/TheSpaceDevs/config.yaml
   ```

   This command:

   * Starts a local graph using the supergraph configuration
   * Starts an MCP Server with the `--mcp` flag
   * Provides a configuration file with MCP Server options

   See the [config file reference](https://www.apollographql.com/docs/apollo-mcp-server/config-file) for a list of available configuration options.

### Run with Docker

1. Modify the MCP server configuration in `graphql/TheSpaceDevs/config.yaml`. Update the paths to point to the `/data` directory, as the Docker container expects:
   ```yaml title=graphql/TheSpaceDevs/config.yaml
   endpoint: https://thespacedevs-production.up.railway.app/
   transport:
     type: streamable_http
   operations:
     source: local
     paths:
       - /data/operations
   schema:
     source: local
     path: /data/api.graphql
   overrides:
     mutation_mode: all
   introspection:
     execute:
       enabled: true
     introspect:
       enabled: true
     search:
       enabled: true
   ```

2. In a new terminal, from the root directory of your local repo, run this Docker command to start the MCP Server:

   ```sh
   docker run \
     -it --rm \
     --name apollo-mcp-server \
     -p 5000:5000 \
     -v $PWD/graphql/TheSpaceDevs/config.yaml:/config.yaml \
     -v $PWD/graphql/TheSpaceDevs:/data \
     ghcr.io/apollographql/apollo-mcp-server:latest /config.yaml
   ```

   This command:

   * Starts an MCP Server in a Docker container
   * Maps configuration files into the proper place for the Apollo MCP Server container
   * Forwards port 5000 for accessing the MCP Server

## Step 3: Verify the MCP Server with MCP Inspector

1. Start MCP Inspector to verify the server is running:

   ```sh
   npx @modelcontextprotocol/inspector
   ```

2. Open a browser and go to [`http://127.0.0.1:6274`](http://127.0.0.1:6274/)

3. In Inspector:

   * Select `Streamable HTTP` as the Transport Type
   * Enter `http://127.0.0.1:5000/mcp` as the URL
   * Click **Connect**, then **List Tools**

   You should see the tools from your server listed.

## Step 4: Connect Claude Desktop

We're using [Claude](https://claude.ai/download) as our AI Assistant (acting as our MCP Client).

First, locate your Claude configuration file:

* **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
* **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
* **Linux**: `~/.config/Claude/claude_desktop_config.json`

Then add the following configuration

1. Open Claude's JSON config file and add this configuration:

   ```json
   {
     "mcpServers": {
       "thespacedevs": {
           "command": "npx",
           "args": [
               "mcp-remote",
               "http://127.0.0.1:5000/mcp"
           ]
       }
     }
   }
   ```

You need Node v18 or later installed for `mcp-remote` to work. If you have an older version of Node, uninstall it and install the latest version from [nodejs.org](https://nodejs.org/).

2. Restart Claude.

## Step 5: Test Your Setup with Claude

Let's verify everything is working:

1. In Claude Desktop, type: "What MCP tools do you have available?"
   * Claude should list tools like `ExploreCelestialBodies`, `GetAstronautDetails`, etc.

2. Try a real query: "Who are the astronauts currently in space?"
   * Claude should use the `GetAstronautsCurrentlyInSpace` tool and return current data

3. If Claude can't see the tools:
   * Ensure you restarted Claude Desktop after editing the config
   * Check that your MCP server is still running
   * Verify the port numbers match between your server and Claude config

## Troubleshooting

### Common Issues

#### MCP Server Won't Start

* **Error**: "Port 5000 is already in use"
  * Solution: Kill any existing processes using port 5000 or specify a different port with the `transport.port` option or `APOLLO_MCP_TRANSPORT__PORT` env variable
* **Error**: "Failed to load supergraph configuration"
  * Solution: Verify you're running the command from the repo root directory
  * Solution: Check that the path to `supergraph.yaml` is correct

#### MCP Inspector Connection Issues

* **Error**: "Failed to connect to server"
  * Solution: Ensure the MCP server is running (check terminal output)
  * Solution: Verify you're using the correct URL (`http://127.0.0.1:5000/mcp`)
  * Solution: Check if your firewall is blocking the connection

#### Claude Desktop Issues

* **Problem**: Claude doesn't recognize the tools
  * Solution: Verify the config file path is correct for your OS
  * Solution: Ensure the JSON is properly formatted (no trailing commas)
  * Solution: Try restarting Claude Desktop completely
* **Problem**: "Connection refused" errors
  * Solution: Check if the MCP server is still running
  * Solution: Verify the port numbers match in both the server and Claude config
* **Problem**: "MCP thespacedevs: Server disconnected" errors
  * Solution: Uninstall older versions of Node. `mcp-remote` only works with Node v18 or later.
  * Solution: Restart Claude Desktop

#### Node.js Version Conflicts

**Problem**: Claude Desktop fails to connect with errors like:
- "npm v10.x is known not to run on Node.js v14.x"
- "SyntaxError: Unexpected token '??='"
- "The requested module 'node:fs/promises' does not provide an export named 'constants'"

**Root Cause**: Claude Desktop inherits your system's PATH environment, which may prioritize older Node.js versions that are incompatible with `mcp-remote` (requires Node 18+).

**Solutions**:

1. **Verify your Node version**:
   ```bash
   node --version  # Should be 18.0.0 or higher
   npx --version   # Should work without errors
   ```

2. **If using Node Version Manager (nvm)**:
   
   **macOS/Linux**:
   ```bash
   # Switch to Node 18+
   nvm use 20  # or nvm use 18
   nvm alias default 20  # Make it permanent
   
   # Restart Claude Desktop completely
   ```
   
   **Windows (nvm-windows)**:
   ```cmd
   # Switch to Node 18+
   nvm use 20.11.0  # Use full version number
   
   # Restart Claude Desktop completely
   ```

3. **If using Volta**:
   ```bash
   # Install and pin Node 20 (works on macOS, Linux, Windows)
   volta install node@20
   volta pin node@20  # In your project directory
   
   # Restart Claude Desktop completely
   ```

4. **If using system Node**:
   
   **macOS (Homebrew)**:
   ```bash
   brew uninstall node  # Remove old version
   brew install node     # Install latest
   ```
   
   **Linux (Ubuntu/Debian)**:
   ```bash
   # Remove old Node
   sudo apt remove nodejs npm
   
   # Install Node 20 via NodeSource
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```
   
   **Windows**:
   - Uninstall Node from Programs & Features
   - Download and install Node 18+ from [nodejs.org](https://nodejs.org/)
   - Restart Claude Desktop completely

5. **For complex environments with multiple Node versions**:
   - Use the full path to the correct npx in your Claude config:
   
   **macOS/Linux example**:
   ```json
   {
     "mcpServers": {
       "thespacedevs": {
         "command": "/usr/local/bin/npx",
         "args": [
           "mcp-remote",
           "http://127.0.0.1:5000/mcp"
         ]
       }
     }
   }
   ```
   
   **Windows example**:
   ```json
   {
     "mcpServers": {
       "thespacedevs": {
         "command": "C:\\Program Files\\nodejs\\npx.cmd",
         "args": [
           "mcp-remote",
           "http://127.0.0.1:5000/mcp"
         ]
       }
     }
   }
   ```
   
   **Find the correct path**:
   - **macOS/Linux**: `which npx` (after ensuring `node --version` shows 18+)
   - **Windows**: `where npx` or check `C:\Program Files\nodejs\npx.cmd`

6. **Alternative: Use Docker to avoid version conflicts**:
   - Follow the Docker setup instructions instead
   - This provides a completely isolated environment

**Important**: Always restart Claude Desktop completely after making Node.js or configuration changes. Claude Desktop caches the environment and won't pick up changes until restarted.

#### Platform-Specific Considerations

**Windows**:
- Use `npx.cmd` (not just `npx`) when specifying full paths
- Use double backslashes `\\` in JSON paths or forward slashes `/`
- Environment variables like `PATH` may not update until you restart your terminal or log out/in
- Windows Defender or antivirus software may block `mcp-remote` - add exclusions if needed
- If using WSL, ensure you're using Windows Node.js, not WSL's Node.js

**Linux**:
- Some distributions package Node.js as `nodejs` instead of `node` - install the `nodejs-legacy` package or create a symlink
- Check if `snap` installed Node.js (`snap list | grep node`) - snap packages can cause PATH issues
- AppImages and Flatpak versions of Claude Desktop may have restricted filesystem access
- For Ubuntu/Debian: prefer NodeSource repository over default apt packages for newer versions

**All Platforms**:
- VS Code and other editors may have their own Node.js versions that can interfere
- Corporate networks may block npm registry access - configure proxy settings if needed
- Virtual environments (Docker Desktop, VMs) may affect localhost connectivity

#### GraphQL Operation Issues

* **Error**: "Operation not found"
  * Solution: Verify the operation files exist in the specified path
  * Solution: Check that the operation names match exactly
* **Error**: "Schema validation failed"
  * Solution: Ensure your GraphQL operations match the schema
  * Solution: Check for syntax errors in your operation files

### Getting Help

If you're still having issues:

1. Check the [Apollo MCP Server GitHub issues](https://github.com/apollographql/apollo-mcp-server/issues)
2. Join the [Apollo Community MCP Server Category](https://community.apollographql.com/c/mcp-server/41)
3. Contact your Apollo representative for direct support

## Next Steps

Learn how to define tools from:

* [Operation files](https://www.apollographql.com/docs/apollo-mcp-server/define-tools#from-operation-files)
* [Persisted query manifests](https://www.apollographql.com/docs/apollo-mcp-server/define-tools#from-persisted-query-manifests)
* [Operation collections](https://www.apollographql.com/docs/apollo-mcp-server/define-tools#from-operation-collection)
* [Schema introspection](https://www.apollographql.com/docs/apollo-mcp-server/define-tools#introspection-tools)

When you are ready, [deploy the MCP server](https://www.apollographql.com/docs/apollo-mcp-server/deploy).

### Additional Resources

Check out these blog posts to learn more about Apollo MCP Server:

* [Getting started with Apollo MCP Server](https://www.apollographql.com/blog/getting-started-with-apollo-mcp-server-for-any-graphql-api)
* [The Future of MCP is GraphQL](https://www.apollographql.com/blog/the-future-of-mcp-is-graphql)

### Advanced Options

Alternative ways to run the MCP Server

#### Using STDIO Transport

You can run the MCP Server using STDIO transport instead of Streamable HTTP. This is useful for certain environments or when you need more direct control over the server process.

1. Download the binary of the latest version of Apollo MCP Server

2. Use MCP Inspector to run the server:

   ```yaml title=Config for stdio transport
   endpoint: https://thespacedevs-production.up.railway.app/
   operations:
     source: local
     paths:
     - <absolute-path-to-MCP-example-dir>/operations
   schema:
     source: local
     path: <absolute-path-to-MCP-example-dir>/api.graphql
   transport:
     type: stdio
   ```

   ```sh
   npx @modelcontextprotocol/inspector apollo-mcp-server <path to the preceding config>
   ```

3. Configure Claude Desktop to use STDIO:

   ```json
   {
     "mcpServers": {
       "thespacedevs": {
         "command": "<absolute-path-to-MCP-server-binary>",
         "args": [
           "<path to the preceding config>"
         ]
       }
     }
   }
   ```