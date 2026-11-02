# =============================================================================
# Apollo MCP Server Dockerfile
# =============================================================================
#
# This Dockerfile sets up the Apollo MCP (Model Context Protocol) Server
# to expose your GraphQL API as tools that AI assistants like Claude can use.
#
# The Apollo MCP Server acts as a bridge between your GraphQL API and MCP
# clients, automatically converting GraphQL operations into callable tools.
#
# RECOMMENDED USE:
# - Development and testing with MCP Inspector or Claude Desktop
# - Local development and prototyping
#
# USAGE:
# 1. Build: docker build -f mcp.Dockerfile -t {{PROJECT_NAME}} .
# 2. Run:   docker run -p 8000:8000 --env-file .env {{PROJECT_NAME}}
#    On Linux, host.docker.internal does not reach a GraphQL API that
#    listens only on 127.0.0.1 (the rover dev default). Use host networking:
#    docker run --network=host -e APOLLO_MCP_ENDPOINT=http://localhost:4000 --env-file .env {{PROJECT_NAME}}
# 3. Test:  npx @modelcontextprotocol/inspector (Transport: HTTP, URL: http://localhost:8000/mcp)
#
# =============================================================================

# Pinned to an exact release so a new major version cannot break this file.
# To upgrade, change the tag and check that the config in .apollo/ still loads.
FROM ghcr.io/apollographql/apollo-mcp-server:v2.1.0

# =============================================================================
# METADATA AND LABELS
# =============================================================================

# Add metadata about this image
LABEL org.opencontainers.image.title="{{PROJECT_NAME}} MCP Server"
LABEL org.opencontainers.image.description="Apollo MCP Server for {{PROJECT_NAME}} GraphQL API"
LABEL org.opencontainers.image.vendor="Apollo GraphQL"

# =============================================================================
# COPY APPLICATION FILES
# =============================================================================

# Note: base image is pre-configured with appropriate user restrictions for security

# Copy MCP configuration file into the image's working directory (/data),
# where CMD ["mcp.yaml"] below looks for it
COPY .apollo/mcp.local.yaml /data/mcp.yaml

# Copy any custom schema files or additional configuration
# COPY schema.graphql /app/schema.graphql
# COPY custom-resolvers.js /app/custom-resolvers.js

# =============================================================================
# RUNTIME CONFIGURATION
# =============================================================================

# Note: Base image is pre-configured with proper non-root user security

# Inside the container, localhost is the container itself, not your machine.
# Point the server at the GraphQL API running on the host instead.
# This overrides the `endpoint` value in mcp.yaml.
ENV APOLLO_MCP_ENDPOINT=http://host.docker.internal:4000

# Expose the MCP server port
# The MCP server listens on this port for connections from AI assistants
EXPOSE 8000

# =============================================================================
# STARTUP COMMAND
# =============================================================================

# Start the Apollo MCP Server
# The server will:
# 1. Read mcp.yaml from the working directory (/data)
# 2. Connect to APOLLO_MCP_ENDPOINT (set above)
# 3. Start MCP server on port 8000
CMD ["mcp.yaml"]

# =============================================================================
# TROUBLESHOOTING
# =============================================================================
#
# Common issues and solutions:
#
# 1. Connection refused to GraphQL endpoint:
#    - Ensure APOLLO_MCP_ENDPOINT is reachable from the container
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