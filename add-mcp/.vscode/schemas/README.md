# Apollo MCP Server & Router Schema Configuration

## Overview
This directory contains JSON schemas for Apollo MCP Server and Router YAML configuration files, providing IntelliSense, validation, and documentation in VS Code.

## Features
**Schema Validation** - Red squiggly lines for invalid properties/values
**Hover Documentation** - Descriptions when hovering over properties
**Property Autocomplete** - Suggestions for valid property names
**Error Messages** - Clear messages showing valid values
**Enum Autocomplete** - See known issues below

## Files
- `mcp-server.schema.json` - Apollo MCP Server configuration schema
- `router-config.schema.json` - Apollo Router configuration schema (basic)

## Setup
The schemas are automatically configured in `.vscode/settings.json`.

### Environment Variables
Apollo MCP Server expects these environment variables:
- `APOLLO_KEY` - Your Apollo GraphOS API key
- `APOLLO_GRAPH_REF` - Your graph reference (e.g., `my-graph@current`)
- `GRAPHQL_TOKEN` - Bearer token for GraphQL API authentication (if needed)

No additional setup needed for the schemas themselves.

## Known Issues & Workarounds

### Enum Autocomplete Limitation
The Red Hat YAML extension has a known issue where enum values don't autocomplete in nested properties. For example:

```yaml
transport:
  type: # <-- No autocomplete dropdown here
```

**You'll still see:**
- Validation (red squiggly for invalid values)
- Error tooltip showing valid options: "stdio", "streamable_http", "sse"

**Recommended Workarounds:**

#### Option 1: Use Configuration Snippets
Type these prefixes to insert full configuration blocks:
- `mcpbasic` - Basic MCP config
- `mcphttp` - HTTP transport with auth
- `mcpfull` - Complete configuration

#### Option 2: Reference Valid Values
Valid transport types (copy from here):
- `stdio` - Standard I/O for process communication
- `streamable_http` - HTTP streaming for web clients
- `sse` - Server-Sent Events for real-time updates

#### Option 3: Use Error Messages
Type an invalid value, see the error tooltip, then copy the correct value from the error message.

## Customization

### Adding Your Own Patterns
To apply schemas to your own file patterns, edit `.vscode/settings.json`:

```json
"yaml.schemas": {
  ".vscode/schemas/mcp-server.schema.json": [
    "your-pattern-here.yaml"
  ]
}
```

### Updating Schemas
Schemas are based on Apollo MCP Server documentation. To update:

1. Check [Apollo MCP Server docs](https://www.apollographql.com/docs/apollo-mcp-server/)
2. Update the schema JSON files
3. Test validation with a sample YAML file

### Disabling Schemas
To temporarily disable schema validation, comment out in `.vscode/settings.json`:

```json
"yaml.schemas": {
  // ".vscode/schemas/mcp-server.schema.json": [...]
}
```

## Why Enum Autocomplete Doesn't Work

This is a long-standing limitation of the Red Hat YAML Language Support extension. The extension can validate enum values but doesn't provide IntelliSense for them in nested object properties.

**Related Issues:**
- [redhat-developer/yaml-language-server#108](https://github.com/redhat-developer/yaml-language-server/issues/108)
- [redhat-developer/vscode-yaml#174](https://github.com/redhat-developer/vscode-yaml/issues/174)

## Contributing
If you find inaccuracies in the schemas or have improvements:
1. Verify against [official Apollo documentation](https://www.apollographql.com/docs/)
2. Test your changes with sample YAML files
3. Update this README if adding new features/workarounds

## License
These schemas are provided as development aids based on Apollo's public documentation.