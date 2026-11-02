# Rover Init Starters – Release Process

**Purpose**: This document describes how changes reach users of `rover init`. For template structure, manifest fields and validation requirements, follow `CONTRIBUTING.md`.

## Branches

- `main` is the development branch. All PRs, including Renovate and other automated PRs, target `main` first.
- `release/v3` is the live branch. `rover init` downloads templates from it when a user runs the command, so a change merged into `release/v3` reaches users immediately. There is no separate publish step.
- `release/v2` and `releases/v1` are older release branches. Do not change them unless a fix for older Rover versions is needed.

`main` usually contains changes that are not ready to ship. **Never merge `main` into `release/v3` as a whole.** Move individual changes with a backport PR, as described below.

## Shipping a change to `release/v3`

### 1. Merge the change into `main`

Open the PR against `main` as usual. Before merging, decide whether the change should ship:

- **Ship it**: bug fixes, security fixes and dependency updates that users need, and finished template changes.
- **Do not ship it yet**: work in progress, changes that depend on unreleased Rover or router versions, and repo tooling that only affects CI.

### 2. Open the backport PR

**Recommended: use the label.** Add the `backport release/v3` label to the PR. You can add it before or after the merge. When the PR is merged, the [Backport workflow](.github/workflows/backport.yml) cherry-picks it onto a new branch and opens a PR to `release/v3`. The original author is assigned.

The workflow does not merge anything. If the cherry-pick has conflicts, it comments on the original PR and you backport by hand.

**By hand:**

```bash
git fetch origin
git switch -c <topic>-release-v3 origin/release/v3
git cherry-pick -x <merge-commit-sha-from-main>
git push -u origin <topic>-release-v3
gh pr create --base release/v3
```

### 3. Review the backport PR

- Confirm CI passes. If the PR was opened by the workflow without a GitHub App token, CI does not start on its own: close and reopen the PR to run the checks.
- If the change affects users, add an entry under `## [Unreleased]` in `CHANGELOG.md` on the backport branch.
- Check the diff contains only the intended change. A cherry-pick can pull in context that differs between `main` and `release/v3`.
- For breaking changes (removed or renamed `manifest.json` fields, renamed template files), tag @team-growth for review and include migration steps. A breaking change may need a new release branch instead.

### 4. Merge and verify

Squash and merge the backport PR. Then confirm the change with a real run:

```bash
rover init
```

Choose the affected template and check that it builds and its tests pass.

## Backport workflow setup

The workflow works with the default `GITHUB_TOKEN`. PRs opened with `GITHUB_TOKEN` do not trigger other workflows, so CI does not start on backport PRs until someone closes and reopens them.

To have CI start automatically, a repo admin can create a GitHub App with `contents: write` and `pull-requests: write` permissions, install it on this repo, and set:

- Repository variable `BACKPORT_APP_ID`
- Repository secret `BACKPORT_APP_PRIVATE_KEY`

## Announcing changes

For notable changes, announce in Slack or internal channels once the backport PR is merged.

---

If you have questions or need clarification, open an issue or contact the maintainers.
