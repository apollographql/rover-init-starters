# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Fixed
- `start-with-typescript`: `graphql` is pinned to `^16.12.0` instead of
  `latest`. `latest` now resolves to graphql 17, which the template's
  dependencies do not support, so installing without the lock file failed.
- `start-with-typescript`: the lockfile now installs patched versions of
  vulnerable dependencies, including all critical ones. `@apollo/server` is
  5.5.1 and `@apollo/subgraph` is 2.14.4. `graphql` stays on 16.
- `start-with-typescript`: `buildSubgraphSchema` now receives an array of
  modules (`[{ typeDefs, resolvers }]`). `@apollo/subgraph` 2.15 removed the
  `{ typeDefs, resolvers }` object form, so a fresh install that resolved 2.15
  failed to compile.
- `add-mcp`: the Docker commands in `MCP_README.md`, `mcp.Dockerfile` and the
  `.apollo` config comments now expose the MCP server only on your own machine
  (`-p 127.0.0.1:8000:8000`, or `APOLLO_MCP_TRANSPORT__ADDRESS=127.0.0.1` with
  `--network=host`). The server has no authentication and can run mutations,
  so `-p 8000:8000` made it reachable from other machines on the network.
- `add-mcp`: MCP config files now load on apollo-mcp-server 1.7 and later.
  `name`/`description` are replaced by `server_info.title`, which every
  supported server version accepts.
- `add-mcp`: the Apollo API key is no longer written into committed files.
  - `.vscode/settings.json` no longer sets `APOLLO_KEY`/`APOLLO_GRAPH_REF` in
    the terminal environment. These values live only in `.env`.
  - `.apollo/mcp.staging.yaml` reads the key at startup with `${env.APOLLO_KEY}`.
  - If you scaffolded a project before this fix, check these two files for a
    real key, remove it, and consider rotating the key.
- `add-mcp`: the "Test MCP Tools" VS Code task uses port 8000, the port the
  server listens on. The "Load Environment" task, which had no effect, is
  removed.
- `add-mcp`: `mcp.Dockerfile` now loads its config: the file is copied to
  `/data/mcp.yaml`, the image's working directory. The container reaches the
  host GraphQL API through `host.docker.internal`, and the README adds Linux
  instructions.

### Changed
- `add-mcp`: `mcp.Dockerfile` pins the base image to
  `ghcr.io/apollographql/apollo-mcp-server:v2.1.0` instead of `latest`.
- `add-mcp`: the VS Code config schema is updated to apollo-mcp-server v1.16.0.
- CI: template tests now also run on `release/**` branches, and MCP config
  templates are checked daily against the latest apollo-mcp-server release.

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
