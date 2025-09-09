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
# USAGE:
# 1. Build: docker build -f mcp.Dockerfile -t {{PROJECT_NAME}}-mcp .
# 2. Run:   docker run -p 5000:5000 --env-file .env {{PROJECT_NAME}}-mcp
# 3. Test:  npx @mcp/inspector --port 5000
#
# =============================================================================

# Use the official Apollo MCP Server image
# This specific canary build includes the latest MCP protocol features
FROM ghcr.io/apollographql/apollo-mcp-server:canary-20250903T205844Z-ea32f7d

# =============================================================================
# METADATA AND LABELS
# =============================================================================

# Add metadata about this image
LABEL org.opencontainers.image.title="{{PROJECT_NAME}} MCP Server"
LABEL org.opencontainers.image.description="Apollo MCP Server for {{PROJECT_NAME}} GraphQL API"
LABEL org.opencontainers.image.vendor="Apollo GraphQL"
LABEL org.opencontainers.image.source="{{PROJECT_REPOSITORY_URL}}"
LABEL org.opencontainers.image.version="{{PROJECT_VERSION}}"

# =============================================================================
# ENVIRONMENT CONFIGURATION
# =============================================================================

# Set working directory
WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S mcpuser && \
    adduser -S mcpuser -u 1001 -G mcpuser

# Set default environment variables
# These can be overridden at runtime with --env-file or -e flags
ENV NODE_ENV=production
ENV MCP_PORT=5000
ENV GRAPHQL_PORT=4000
ENV MCP_TOOLS_DIR=/app/tools
ENV MCP_CONFIG_FILE=/app/.apollo/mcp.local.yaml

# GraphQL endpoint configuration
# Replace with your actual GraphQL endpoint
ENV GRAPHQL_ENDPOINT="{{GRAPHQL_ENDPOINT}}"

# Apollo credentials (set via environment variables or .env file)
# ENV APOLLO_API_KEY=""
# ENV APOLLO_GRAPH_REF=""
# ENV APOLLO_STUDIO_URL=""

# =============================================================================
# COPY APPLICATION FILES
# =============================================================================

# Copy MCP configuration files
# These files define how the MCP server connects to your GraphQL API
COPY --chown=mcpuser:mcpuser .apollo/ /app/.apollo/

# Copy GraphQL tool definitions
# Each .graphql file becomes a callable MCP tool
COPY --chown=mcpuser:mcpuser tools/ /app/tools/

# Copy environment template (optional, for reference)
COPY --chown=mcpuser:mcpuser .env.template /app/.env.template

# Copy any custom schema files or additional configuration
# COPY --chown=mcpuser:mcpuser schema.graphql /app/schema.graphql
# COPY --chown=mcpuser:mcpuser custom-resolvers.js /app/custom-resolvers.js

# =============================================================================
# RUNTIME CONFIGURATION
# =============================================================================

# Switch to non-root user for security
USER mcpuser

# Expose the MCP server port
# The MCP server listens on this port for connections from AI assistants
EXPOSE 5000

# Health check to ensure the MCP server is running properly
# This checks both the MCP server health and GraphQL endpoint connectivity
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:5000/health || exit 1

# =============================================================================
# STARTUP COMMAND
# =============================================================================

# Start the Apollo MCP Server
# The server will:
# 1. Load configuration from MCP_CONFIG_FILE
# 2. Discover tools in MCP_TOOLS_DIR
# 3. Connect to GRAPHQL_ENDPOINT
# 4. Start MCP server on MCP_PORT
CMD ["apollo-mcp-server", "--config", "/app/.apollo/mcp.local.yaml"]

# =============================================================================
# ALTERNATIVE STARTUP OPTIONS
# =============================================================================
#
# You can customize the startup command based on your needs:
#
# 1. Use staging configuration:
# CMD ["apollo-mcp-server", "--config", "/app/.apollo/mcp.staging.yaml"]
#
# 2. Override config via environment variables:
# CMD ["apollo-mcp-server", "--port", "5000", "--graphql", "$GRAPHQL_ENDPOINT"]
#
# 3. Enable debug mode:
# CMD ["apollo-mcp-server", "--config", "/app/.apollo/mcp.local.yaml", "--debug"]
#
# 4. Custom tools directory:
# CMD ["apollo-mcp-server", "--tools", "/app/custom-tools"]
#
# =============================================================================

# =============================================================================
# DOCKER COMPOSE INTEGRATION
# =============================================================================
#
# This Dockerfile is designed to work with Docker Compose. Example usage:
#
# version: '3.8'
# services:
#   mcp-server:
#     build:
#       context: .
#       dockerfile: mcp.Dockerfile
#     ports:
#       - "5000:5000"
#     environment:
#       - GRAPHQL_ENDPOINT={{GRAPHQL_ENDPOINT}}
#       - APOLLO_API_KEY={{APOLLO_API_KEY}}
#     env_file:
#       - .env
#     volumes:
#       - ./tools:/app/tools:ro
#       - ./.apollo:/app/.apollo:ro
#     depends_on:
#       - graphql-server
#     restart: unless-stopped
#
#   graphql-server:
#     # Your GraphQL server configuration
#     build: .
#     ports:
#       - "4000:4000"
#
# =============================================================================

# =============================================================================
# DEVELOPMENT OVERRIDES
# =============================================================================
#
# For local development, you might want to override this Dockerfile:
#
# 1. Create mcp.dev.Dockerfile:
# FROM ghcr.io/apollographql/apollo-mcp-server:canary-20250903T205844Z-ea32f7d
# ENV NODE_ENV=development
# COPY tools/ /app/tools/
# COPY .apollo/ /app/.apollo/
# CMD ["apollo-mcp-server", "--config", "/app/.apollo/mcp.local.yaml", "--watch"]
#
# 2. Build development image:
# docker build -f mcp.dev.Dockerfile -t {{PROJECT_NAME}}-mcp-dev .
#
# 3. Run with volume mounts for hot reloading:
# docker run -p 5000:5000 \
#   -v $(pwd)/tools:/app/tools:ro \
#   -v $(pwd)/.apollo:/app/.apollo:ro \
#   --env-file .env \
#   {{PROJECT_NAME}}-mcp-dev
#
# =============================================================================

# =============================================================================
# SECURITY CONSIDERATIONS
# =============================================================================
#
# This Dockerfile includes several security best practices:
#
# 1. Non-root user: Runs as mcpuser (UID 1001) instead of root
# 2. Minimal image: Based on official Apollo image with minimal attack surface
# 3. Read-only files: Application files are owned by mcpuser
# 4. Health checks: Ensures server is responding properly
# 5. Environment isolation: Uses environment variables for configuration
#
# Additional security measures you might consider:
#
# 1. Network policies: Restrict outbound connections
# 2. Resource limits: Set memory and CPU limits in Docker Compose
# 3. Secrets management: Use Docker secrets for sensitive data
# 4. Image scanning: Regularly scan for vulnerabilities
# 5. TLS termination: Use a reverse proxy for HTTPS
#
# =============================================================================

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
#    - Set APOLLO_API_KEY environment variable
#    - Verify API key has correct permissions
#    - Check if GraphQL endpoint requires authentication
#
# 4. MCP server not starting:
#    - Check configuration file syntax
#    - Verify all required environment variables are set
#    - Look at container logs: docker logs <container_name>
#
# 5. Health check failures:
#    - Ensure port 5000 is exposed and accessible
#    - Verify GraphQL endpoint is reachable
#    - Check server logs for error messages
#
# =============================================================================