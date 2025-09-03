# Rover Init Starters – Release Process

**Purpose**: This document outlines the release process for the rover-init-starters repo. Templates are pulled by Rover CLI from the releases/v2 branch.

## Pre-Release Validation

### Verify all templates build
→ For each template, run the command in manifest.json and ensure it works.

### Ensure metadata is complete
→ Each entry in manifest.json must include:
- display_name
- path
- command (must not be an empty list)

### Check project structure
→ Template should resemble a real project (README, package.json, etc.)

### Run linting and formatting
→ Ensure all files (especially manifest.json) follow expected formatting.

### Breaking Changes Review
→ Review all changes for breaking modifications:
- Document any removed fields from manifest.json
- Verify migration paths are documented
- Check if versioning is needed for significant changes
- Ensure backward compatibility or document breaking changes

## Prepare Release PR

### Create PR from main to releases/v2
→ Use title: Release [YYYY-MM-DD]
→ Description should include:
- List of new/updated templates
- Links to related PRs or discussions
- Breaking changes summary (if any)
- Migration steps for affected templates

### Version Control
- Current release branch is `releases/v2`
- Merging to older release branches (e.g., `releases/v1`) is restricted
- To merge to an older release branch:
  1. Add the `allow-older-release` label to your PR
  2. Clearly document why the change needs to be backported
  3. Ensure the change is compatible with the older version
  4. Get explicit approval from the maintainers

### Update CHANGELOG.md, example:

```bash
## [v2] - 2025-05-07

Added:
- typescript/express template

Changed:
- go/fiber: updated folder structure and command

Breaking Changes:
- Removed deprecated 'config' field from manifest.json
- Migration guide: [link to migration steps]
```

Tag contributors if they contributed templates

## Merge & Tag

1. Squash & merge into releases/v2

2. Create a Git tag in format: v2.YYYYMMDD

```perl
git tag v2.20250507
git push origin v2.20250507
```

3. Confirm CI passes on the releases/v2 branch

## Post-Release

1. Verify new templates appear via rover init
2. Announce in Slack or internal channels
3. If breaking changes were included:
   - Ensure migration documentation is complete
   - Monitor for any issues from users
   - Be prepared to provide support for migration

## Versioning & Branching

- `releases/v1` is the current release branch. If a breaking change requires a new version, coordinate with @team-growth to create a new branch (e.g., `releases/v2`).
- Tag all releases using the `v2.YYYYMMDD` format.

---

If you have questions or need clarification, open an issue or contact the maintainers.
