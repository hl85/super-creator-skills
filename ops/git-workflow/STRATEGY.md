# Git Workflow Strategy

## Overview

Super-creator uses **Git Flow** branching model with automated release process.

```
main (production)
 ├── v3.0.0 (tag)
 ├── v3.0.1 (tag)
 └── v3.1.0 (tag)

develop (integration)
 ├── feature/user-auth
 ├── feature/performance
 ├── release/3.1.0 (temporary)
 └── (merges from main)

hotfix (emergency fixes)
 └── hotfix/security-patch (created from main)
```

## Branch Types

### main (Production)

**Purpose**: Stable, released code

**Rules**:
- Protected branch (require PR review)
- Only merge from `release/` or `hotfix/` branches
- Every commit is tagged with version (v3.0.0, v3.0.1, etc.)
- Must always be in releasable state

**Workflow**:
```bash
# DO NOT commit directly to main
# Always use release or hotfix branches

git checkout main
git merge --no-ff release/x.y.z    # After release testing
git tag vx.y.z
git push origin main --follow-tags
```

### develop (Integration)

**Purpose**: Integration branch for feature development

**Rules**:
- Protected branch (require status checks)
- Always keep synchronized with main (after releases)
- Base branch for all feature branches

**Workflow**:
```bash
git checkout develop
git pull origin develop

# Create feature branches from here
git checkout -b feature/my-feature
```

### feature/* (Feature Development)

**Purpose**: Develop individual features or fixes

**Naming convention**: `feature/<feature-name>`

**Rules**:
- Create from: `develop`
- Merge back to: `develop` (via PR)
- Commit message: Conventional commits
- Short-lived (delete after merge)

**Workflow**:
```bash
git checkout develop
git pull origin develop
git checkout -b feature/add-new-skill

# ... make commits ...
git commit -m "feat(new-skill): initial implementation"
git commit -m "feat(new-skill): add tests"
git push origin feature/add-new-skill

# Create PR on GitHub
# After approval and CI passes → merge to develop
```

### release/* (Release Preparation)

**Purpose**: Prepare release (version bump, changelog, testing)

**Naming convention**: `release/x.y.z` (matching version)

**Rules**:
- Create from: `develop`
- Merge to: `main` and back to `develop`
- Only version/changelog commits allowed
- Must be tested before merge to main
- Delete after merging

**Workflow**:
```bash
git checkout -b release/3.1.0 develop

# Verify tests pass
npm test

# Run release automation
/release-skills --dry-run
/release-skills

# This creates:
# - Updated marketplace.json
# - Updated CHANGELOG.md, CHANGELOG.zh.md
# - Commit: "chore: release v3.1.0"
# - Tag: v3.1.0

# Merge to main
git checkout main
git merge --no-ff release/3.1.0
git push origin main --follow-tags

# Merge back to develop
git checkout develop
git merge --no-ff main
git push origin develop

# Delete release branch
git branch -d release/3.1.0
git push origin --delete release/3.1.0
```

### hotfix/* (Emergency Fixes)

**Purpose**: Fix critical bugs in production

**Naming convention**: `hotfix/<fix-name>`

**Rules**:
- Create from: `main` (production branch)
- Merge to: `main` AND `develop`
- Bump patch version only (`--patch` flag)
- Must be tested before merge to main
- Delete after merging

**Workflow**:
```bash
# When critical bug found in production
git checkout -b hotfix/security-vulnerability main

# Fix the bug
git add .
git commit -m "fix(skill-name): critical security fix"

# Test thoroughly
npm test

# Release with patch bump
/release-skills --patch

# Merge to main
git checkout main
git merge --no-ff hotfix/security-vulnerability
git push origin main --follow-tags

# Merge back to develop
git checkout develop
git merge --no-ff main
git push origin develop

# Delete hotfix branch
git branch -d hotfix/security-vulnerability
git push origin --delete hotfix/security-vulnerability
```

## Workflow Examples

### Example 1: Add New Feature

```bash
# 1. Start from develop
git checkout develop
git pull origin develop

# 2. Create feature branch
git checkout -b feature/add-cover-style

# 3. Implement feature
# ... edit cover-image skill ...
git add skills/cover-image/
git commit -m "feat(cover-image): add watercolor style"
git commit -m "test(cover-image): add watercolor style tests"

# 4. Push to GitHub
git push origin feature/add-cover-style

# 5. Create PR on GitHub
# → GitHub shows: Ready to merge into develop from feature/add-cover-style
# → CI checks run automatically
# → Code review happens

# 6. After approval, merge via GitHub (creates merge commit)
# → Feature branch automatically deleted (if configured)

# 7. Local sync
git checkout develop
git pull origin develop
```

### Example 2: Release to Production

```bash
# 1. Create release branch
git checkout -b release/3.1.0 develop

# 2. Verify everything is ready
npm test
node ops/scripts/verify-version-sync.mjs

# 3. Preview release
/release-skills --dry-run

# Expected output:
# Project detected:
#   Version file: marketplace.json (3.0.0)
#   Changelogs: CHANGELOG.md (en), CHANGELOG.zh.md (zh)
# 
# Last tag: v3.0.0
# Proposed version: v3.1.0
# 
# Changes grouped:
#   cover-image:
#     - feat: add watercolor style
#   post-to-x:
#     - fix: handle special characters
#   project:
#     - docs: update CLAUDE.md
# 
# Changelog preview (en):
#   ## 3.1.0 - 2026-05-13
#   ### Features
#   - Add watercolor style to cover-image
#   ### Fixes
#   - Fix special character handling in post-to-x

# 4. Execute release
/release-skills

# This automatically:
# - Updates marketplace.json to 3.1.0
# - Generates CHANGELOG.md 3.1.0 section
# - Generates CHANGELOG.zh.md 3.1.0 section
# - Creates commit: "chore: release v3.1.0"
# - Creates tag: v3.1.0
# - Calls hooks (prepare_artifact, publish_artifact)

# 5. Merge to main
git checkout main
git pull origin main
git merge --no-ff release/3.1.0

# Expected:
# Merge made by the 'recursive' strategy.

# 6. Push main with tags
git push origin main --follow-tags

# 7. Merge back to develop
git checkout develop
git pull origin develop
git merge --no-ff main

# If there are conflicts (changelog), resolve manually:
# - Keep the latest version section from main
# - Commit: "chore: sync develop with main after release"
git push origin develop

# 8. Cleanup
git branch -d release/3.1.0
git push origin --delete release/3.1.0
```

### Example 3: Emergency Hotfix

```bash
# 1. Create hotfix from main
git checkout -b hotfix/fix-wechat-auth main

# 2. Make critical fix
# ... edit post-to-wechat skill ...
git commit -m "fix(post-to-wechat): fix authentication token expiry"

# 3. Test thoroughly
npm test

# 4. Release with patch bump only
/release-skills --patch

# Proposed: 3.0.0 → 3.0.1

# 5. Merge to main
git checkout main
git pull origin main
git merge --no-ff hotfix/fix-wechat-auth
git push origin main --follow-tags

# 6. Merge to develop
git checkout develop
git pull origin develop
git merge --no-ff main
git push origin develop

# 7. Cleanup
git branch -d hotfix/fix-wechat-auth
git push origin --delete hotfix/fix-wechat-auth
```

## GitHub Configuration

### Branch Protection Rules

**For `main` branch**:
- ✅ Require pull request reviews before merging (1 reviewer)
- ✅ Dismiss stale pull request approvals when new commits are pushed
- ✅ Require status checks to pass before merging (CI/CD)
- ✅ Require branches to be up to date before merging
- ✅ Require code reviews to be resolved before merge
- ❌ Do NOT allow direct pushes (use PR workflow)

**For `develop` branch**:
- ✅ Require status checks to pass before merging (CI/CD)
- ✅ Require branches to be up to date before merging
- ⚠️ Allow direct pushes from release and hotfix branches
- ❌ Require PR reviews (optional, for extra safety)

### Required Status Checks

- ✅ CI/CD pipeline (GitHub Actions or similar)
- ✅ All tests passing
- ✅ No merge conflicts

## Conventions

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

<optional body>
```

**Types**: feat, fix, refactor, perf, docs, test, chore, style

**Scope**: skill name or `project`

**Examples**:
```bash
git commit -m "feat(cover-image): add watercolor and minimalist styles"
git commit -m "fix(post-to-x): handle special characters in hashtags"
git commit -m "docs(project): update architecture documentation"
git commit -m "refactor(imagine): improve prompt generation logic"
```

### Merge Commits

Always use `--no-ff` (no fast-forward) to preserve branch history:

```bash
git merge --no-ff feature/my-feature
# Creates: Merge branch 'feature/my-feature' into develop
```

### Tag Format

Version tags follow Semantic Versioning:

```bash
v3.0.0    # Major release
v3.0.1    # Patch release
v3.1.0    # Minor release
```

Tags are **created automatically** by `/release-skills`.

## Local Setup

One-time setup:

```bash
# Clone repository
git clone https://github.com/hl85/super-creator.git
cd super-creator

# Configure git hooks
node ops/scripts/install-git-hooks.mjs

# Pull all branches
git fetch origin
git checkout develop

# Verify setup
git branch -a
git hooks show    # Should show pre-push hook installed
```

## Daily Operations

```bash
# Start day: sync with remote
git fetch origin
git status

# Create feature branch
git checkout -b feature/my-feature develop
git pull origin develop  # Ensure latest

# ... make changes ...

# Before pushing: verify
node ops/scripts/verify-version-sync.mjs  # If changed versions

# Push
git push origin feature/my-feature

# Create PR on GitHub
```

## Troubleshooting

### "main is not up to date with develop"

```bash
# This can happen after hotfix
# Solution: merge main into develop
git checkout develop
git pull origin develop
git merge origin/main
# Resolve conflicts if any
git push origin develop
```

### Merge Conflict on CHANGELOG

During release merge, CHANGELOG conflicts are expected:

```bash
# When merging release to develop:
# Both branches modified CHANGELOG.md
# Solution:
git status  # Shows CHANGELOG.md as conflicted

# Keep develop's current state (latest additions):
git checkout --theirs CHANGELOG.md
git add CHANGELOG.md
git commit -m "chore: resolve changelog conflicts"
git push
```

### Accidental Commit to main

```bash
# If you committed directly to main (don't do this):
git log --oneline -5  # Identify commit

# Option 1: Revert commit (preferred)
git revert <commit-hash>
git push origin main

# Option 2: Reset and redo (only if not pushed)
git reset --soft HEAD~1
git push -f origin main  # Use with caution!
```

## References

- `ops/release/STRATEGY.md` - Release automation
- `.releaserc.yml` - Release configuration
- `.githooks/` - Git hooks
- `ops/scripts/` - Release scripts
