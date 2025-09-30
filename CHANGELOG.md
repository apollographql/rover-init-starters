# Changelog

All notable changes to this project will be documented in this file.

## [v2.0.0] - 2025-09-30

### Added
- **NEW**: MCP (Model Context Protocol) server template (`add-mcp/`)
  - Enables AI assistants to access GraphQL APIs
  - Includes Docker support and VSCode configuration
  - Quick GraphQL-to-AI integration setup
- Enhanced `.gitignore` files across templates
- `.vscode/settings.json` and `.vscode/tasks.json` configuration files

### Breaking Changes
- **BREAKING**: Standardized template file naming:
  - `products.graphql` → `schema.graphql`
  - `getting-started.md` → `GETTING_STARTED.md`
- Migration guide: Update your template references to use new file names

## [v1.0.0] - 2025-05-12

### Added
- start-with-typescript template
- Schema validation and print_depth support in manifest
- Template test workflow and schema validation in CI
- Community link in GETTING_STARTED.md

### Changed
- Updated folder structure and manifest fields to use `commands` array
- Improved formatting and documentation across templates
- Correctly capitalize TypeScript in manifest.json
- Renamed and updated workflow files for clarity
- Updated manifest fields for clarity and validation
- Various fixes to tests and template files

### Breaking Changes
- Removed deprecated `config` field from manifest.json
- Removed federation test from workflow
- Several reverts and re-additions of the TypeScript template during initial setup
- Migration guide: See PR and documentation for migration steps

---

For details on individual changes, see the commit log.
