# Rover Init Starters – Release Process

**Purpose**: This document outlines the release process for the rover-init-starters repo. For template contribution and requirements, always follow the latest `CONTRIBUTING.md` guidelines. This document focuses on the steps and checks specific to preparing and publishing a release.

## Pre-Release Checklist

Before preparing a release, ensure all new and updated templates strictly follow the `CONTRIBUTING.md` guidelines. Do not duplicate those steps here—refer to that document for template structure, manifest fields, and validation requirements.

- For each template, run the commands and `test_commands` listed in `manifest.json` and ensure all build and tests pass.
- Confirm that CI checks (see `.github/workflows/templates-test.yml`) pass for all templates.
- Review for breaking changes:
  - If fields are removed or updated in `manifest.json`, document them clearly and tag @team-growth for review. Breaking changes may require a new versioned branch.
  - Provide migration steps for affected templates and ensure documentation is complete.

## Prepare Release PR

1. **Create PR from `main` to `releases/v1`**
   - Use title: `Release [YYYY-MM-DD]`
   - Description should include:
     - List of new/updated templates
     - Links to related PRs or discussions
     - Breaking changes summary (if any)
     - Migration steps for affected templates (link to docs or include inline)
     - Tag all contributors involved

2. **Update `CHANGELOG.md`** (repo root)
   - Use the following format:

```markdown
## [v1] - 2025-05-07

### Added
- start-with-typescript template

### Changed
- start-with-go: updated folder structure and commands

### Breaking Changes
- Removed deprecated `config` field from manifest.json
- Migration guide: [link to migration steps]
```

## Merge & Tag

1. Squash & merge into `releases/v1`.
2. Create a Git tag in format: `v1.YYYYMMDD`

```bash
git tag v1.20250507
git push origin v1.20250507
```

3. Confirm CI passes on the `releases/v1` branch.

## Post-Release

1. Verify new templates appear via `rover init`.
2. Announce the release in Slack or internal channels. Use a checklist or release template for consistency.
3. If breaking changes were included:
   - Ensure migration documentation is complete (in PR, docs folder, or linked from changelog)
   - Monitor for any issues from users
   - Be prepared to provide support for migration

## Versioning & Branching

- `releases/v1` is the current release branch. If a breaking change requires a new version, coordinate with @team-growth to create a new branch (e.g., `releases/v2`).
- Tag all releases using the `v1.YYYYMMDD` format.

---

If you have questions or need clarification, open an issue or contact the maintainers.
