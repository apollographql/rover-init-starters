# =============================================================================
# Apollo MCP Server Dockerfile
# =============================================================================
#
# ⚠️ NOTICE ⚠️
# This Dockerfile uses a build that has limitations
# for production use. 
#
# This Dockerfile sets up the Apollo MCP (Model Context Protocol) Server
# to expose your GraphQL API as tools that AI assistants like Claude can use.
#
# The Apollo MCP Server acts as a bridge between your GraphQL API and MCP
# clients, automatically converting GraphQL operations into callable tools.
#
# RECOMMENDED USE:
# ✅ Development and testing with MCP Inspector or Claude Desktop
# ✅ Local development and prototyping
# ❌ Production deployment without security review
#
# USAGE:
# 1. Build: docker build -f mcp.Dockerfile -t {{PROJECT_NAME}} .
# 2. Run:   docker run -p 5000:5000 --env-file .env {{PROJECT_NAME}}
# 3. Test:  npx @mcp/inspector (Transport: HTTP, URL: http://localhost:5000/mcp)
#
# =============================================================================

# This uses a build that is NOT a production release
# Not recommended for production
FROM ghcr.io/apollographql/apollo-mcp-server:canary-20250903T205844Z-ea32f7d

# =============================================================================
# METADATA AND LABELS
# =============================================================================

# Add metadata about this image
LABEL org.opencontainers.image.title="{{PROJECT_NAME}} MCP Server"
LABEL org.opencontainers.image.description="Apollo MCP Server for {{PROJECT_NAME}} GraphQL API"
LABEL org.opencontainers.image.vendor="Apollo GraphQL"

# =============================================================================
# ENVIRONMENT CONFIGURATION
# =============================================================================

# Set environment variables for the MCP server within your .env file.

# =============================================================================
# COPY APPLICATION FILES
# =============================================================================

# Note: base image is pre-configured with appropriate user restrictions for security

# Copy MCP configuration files
# These files define how the MCP server connects to your GraphQL API
COPY .apollo/ /app/.apollo/

# Copy GraphQL tool definitions
# Each .graphql file becomes a callable MCP tool
COPY tools/ /app/tools/

# Copy environment template (optional, for reference)
# COPY .env.template /app/.env.template

# Copy any custom schema files or additional configuration
# COPY schema.graphql /app/schema.graphql
# COPY custom-resolvers.js /app/custom-resolvers.js

# =============================================================================
# RUNTIME CONFIGURATION
# =============================================================================

# Note: Base image is pre-configured with proper non-root user security

# Expose the MCP server port
# The MCP server listens on this port for connections from AI assistants
EXPOSE 5000

# =============================================================================
# STARTUP COMMAND
# =============================================================================

# Start the Apollo MCP Server
# The server will:
# 1. Auto-discover configuration files in current directory
# 2. Load tools from MCP_TOOLS_DIR (/app/tools)
# 3. Connect to GRAPHQL_ENDPOINT
# 4. Start MCP server on MCP_PORT (5000)
WORKDIR /app
CMD ["apollo-mcp-server"]

# =============================================================================
# TROUBLESHOOTING
# =============================================================================
#
# Common issues and solutions:
#
# 1. Connection refused to GraphQL endpoint:
#    - Ensure GRAPHQL_ENDPOINT is accessible from the container
#    - Check if GraphQL server is running
#    - Verify network connectivity between containers
#
# 2. Tools not loading:
#    - Ensure .graphql files are in the tools/ directory
#    - Check file permissions and ownership
#    - Verify GraphQL syntax in tool files
#
# 3. Authentication failures:
#    - Set APOLLO_KEY environment variable
#    - Verify API key has correct permissions
#    - Check if GraphQL endpoint requires authentication
#
# 4. MCP server not starting:
#    - Check configuration file syntax
#    - Verify all required environment variables are set
#    - Look at container logs: docker logs <container_name>
#
# =============================================================================