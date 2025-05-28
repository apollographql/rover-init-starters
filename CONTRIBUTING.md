# Contributing to Rover Init Starters

This document outlines the process for contributing new templates to the rover-init-starters repository.

## Table of Contents
1. [Template Contribution Guidelines](#template-contribution-guidelines)
2. [Template Requirements](#template-requirements)
3. [Breaking Changes](#breaking-changes)
4. [Testing Your Template](#testing-your-template)
5. [Code Style](#code-style)
6. [Pull Request Process](#pull-request-process)

## Template Contribution Guidelines

### Adding a New Template

1. Create a folder in the root of the rover-init-starters repository.
   - Ensure the name is descriptive of the "starting" experience (e.g., `start-with-typescript`). Use kebab-case for folder names.

2. Required Artifacts (must-have items for every starter):
   - **Getting started documentation**: A `getting-started.md` file (or custom name, see `start_point_file` below). This file should explain what the starter is, how to use it, and any educational context.
   - **Project files**: All files needed for the starter to build and run (e.g., `package.json`, source files, configs).
   - **Test files**: Include tests to verify the starter works as intended.
   - **Manifest fields mapping**: Ensure your starter provides the following, which will be referenced in `manifest.json`:
     - A unique template identifier (`id`)
     - A display name (`display_name`)
     - The folder path (`path`)
     - Main commands to run the starter (`commands`)
     - The language the template represents (`language`)
     - Minimum federation version (`federation_version`)
     - Test commands (`test_commands`)
     - Routing URL where the subgraph is exposed (`routing_url`)
     - (Optional) Maximum schema depth (`max_schema_depth`)
     - (Optional) Print depth (`print_depth`)
     - (Optional) Custom getting started file name (`start_point_file`)
   - These fields must be present in your starter and will be tied directly to your `manifest.json` entry.

3. Add to `manifest.json` with:

```json
{
  "id": "typescript",
  "display_name": "Start with TypeScript",
  "path": "start-with-typescript",
  "commands": ["npm ci", "npm run dev"],
  "language": "TypeScript",
  "federation_version": "=2.10.0",
  "max_schema_depth": 5,
  "test_commands": ["npm ci", "npm test"],
  "routing_url": "http://localhost:4001",
  "print_depth": 2
}
```

**Note:** Remove comments from the JSON in your actual manifest file, as JSON does not support comments.

4. Test that the starter runs without issues.

5. Commit message: `Add new template: <Template Name>`

## Template Requirements

Each template must include the following in `manifest.json`:

\| Field \| Type \| Description \|
--
\| --- \| --- \| --- \|
\| `id` \| String \| Unique identifier among all starters \|
\| `display_name` \| String \| Name displayed in selector for `rover init` \|
\| `path` \| String \| Repository path to the template \|
\| `commands` \| String[] \| Array of commands required to run the starter (must not be empty)\|
\| `language` \| String \| Programming language the template represents \|
\| `federation_version` \| String \| Minimum federation version supported \|
\| `test_commands` \| String[] \| Commands to verify the starter builds and runs tests \|
\| `routing_url` \| String \| URL where the subgraph is exposed \|
\| `max_schema_depth` \| Int (optional) \| Maximum depth for GraphQL file discovery (defaults to 5) \|
\| `print_depth` \| Int (optional) \| Controls file display depth during init execution \|
\| `start_point_file` \| String (optional) \| Custom name for the "getting started" documentation file (defaults to `getting-started.md`) \|

Required files:
- Getting started documentation (default: `getting-started.md`)
- All necessary project files (`package.json`, source files, etc.)
- Test files to verify the starter works

## Breaking Changes

When making breaking changes to existing templates:

1. Clearly document the changes in your PR description.
2. Update the template's getting-started documentation to reflect the changes.
3. If removing or updating `manifest.json` fields:
   - Document any removed or changed fields.
   - Provide migration steps if applicable.
   - Tag @team-growth for review and prioritization as this change requires a new versioned branch.

## Testing Your Template

1. Run all commands specified in `manifest.json`:
   - Main commands (under `commands`)
   - Test commands (under `test_commands`)
2. Verify all dependencies install correctly.
3. Ensure the template builds and runs without errors.
4. Test the template with different configurations if applicable.
5. Verify the `routing_url` is accessible and working.
6. Test with the specified `federation_version`.
7. Add CI checks (see `.github/workflows/templates-test.yml`).

## Code Style

- Follow the existing code style in the repository.
- Ensure all files are properly formatted.
- Run linting tools (e.g., ESLint, Prettier) before submitting your PR.
- Maintain consistent documentation style in getting-started files.
- Follow the established naming conventions for template folders (kebab-case).
- Reference the repository's style guide if available.

## Pull Request Process

1. Fork the repository and create your branch from `main`.
2. Ensure your code passes all tests and linting checks.
3. Submit a pull request (PR) with a descriptive title and summary.
4. Link any related issues in your PR description.
5. Clearly describe any breaking changes and migration steps.
6. Wait for review and address any requested changes.
7. At least one reviewer must approve before merging.

---

If you have questions, open an issue or contact the maintainers.