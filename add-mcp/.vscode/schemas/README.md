# Apollo Configuration Schemas for VS Code

This directory contains JSON schemas that provide IntelliSense, validation, and auto-completion for Apollo configuration files in VS Code.

## MCP Server Schema

**File:** `mcp-server.schema.json`

Provides validation and IntelliSense for Apollo MCP Server configuration files:
- `.apollo/mcp.*.yaml`
- `mcp.*.yaml`

This schema covers all known MCP server configuration options including:
- Transport configuration (stdio, streamable_http, websocket)
- GraphQL introspection settings
- Operation sources (collection, manifest, introspection)
- Authentication and CORS settings
- Logging configuration

## Router Configuration Schema

**File:** `router-config.schema.json`

Provides basic validation for Apollo Router configuration files:
- `router.yaml`
- `.apollo/router*.yaml`

### Generating Complete Router Schema

For the most complete and up-to-date Apollo Router configuration schema, generate it locally:

```bash
# Make sure you have Apollo Router installed
# Download from: https://github.com/apollographql/router/releases

# Generate the complete schema
./router config schema > .vscode/schemas/router-config.schema.json
```

This will replace the basic schema with the complete, official schema that includes all router configuration options.

## VS Code Configuration

The schemas are automatically configured in `.vscode/settings.json`:

```json
{
  "yaml.schemas": {
    ".vscode/schemas/mcp-server.schema.json": [
      ".apollo/mcp.*.yaml",
      "mcp.*.yaml"
    ],
    ".vscode/schemas/router-config.schema.json": [
      "router.yaml",
      "*/router.yaml",
      ".apollo/router*.yaml"
    ]
  }
}
```

## Usage

Once configured, VS Code will automatically provide:
- ✅ Auto-completion for configuration properties
- ✅ Validation errors for invalid configurations
- ✅ Documentation on hover for configuration options
- ✅ Schema-aware formatting and linting

Perfect for live demos and development! 🎬