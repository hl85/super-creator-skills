# Repository Guidelines

## Project Structure

```
skills/          # 25+ Claude Code skills (each with SKILL.md, scripts/, references/)
packages/        # Shared TypeScript libraries (sc-fetch, sc-chrome-cdp, sc-md)
ops/scripts/     # Repo maintenance: release, sync, hooks, tests
docs/            # Guides: testing, chrome-setup, publishing, image-generation
.claude-plugin/  # Plugin registry (marketplace.json)
```

Each skill follows a standard layout: `SKILL.md` (YAML frontmatter + docs under 30 lines), optional `scripts/`, `references/`, `prompts/`. Shared vendor code lives in `packages/` and is synced into skills at release time.

## Build, Test, and Development

```bash
npm test                  # Run all tests via node:test
npm run test:coverage     # Tests with coverage report
node ops/scripts/verify-version-sync.mjs   # Check version consistency
node ops/scripts/sync-shared-skill-packages.mjs  # Sync shared packages
```

TypeScript runs via Bun (no build step). Detect runtime: `bun` preferred, fallback `npx -y bun`.

```bash
bun skills/<skill>/scripts/main.ts [args]
```

## Coding Style

- TypeScript with `type: "module"` (ESM).
- No code comments unless the logic is genuinely non-obvious.
- Async/await over raw promises. Short, descriptive variable names.
- Type-safe interfaces for all structured data.
- 2-space indentation, single quotes not enforced (follow existing file conventions).

## Testing

- Framework: `node:test` (Node.js built-in). No Jest or Vitest.
- Test files: `*.test.ts` colocated with source or in `__tests__/` directories.
- Run: `npm test`. Coverage: `npm run test:coverage`.
- CI runs on every push and PR via GitHub Actions (Node 22).
- Prefer temp directories over committed fixtures. Keep tests free of network, browser, and credential dependencies.

## Commit Convention

[Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>
```

Types: `feat`, `fix`, `refactor`, `perf`, `docs`, `test`, `chore`. Scope is the skill name or `project`.

```
feat(cover-image): add watercolor style
fix(post-to-x): handle special characters in hashtags
docs(project): update architecture documentation
```

## Branching and Pull Requests

Git Flow model: `main` (production), `develop` (integration), `feature/*`, `release/*`, `hotfix/*`.

- Create feature branches from `develop`. Merge via PR after CI passes.
- Use `--no-ff` merges to preserve branch history.
- PRs should include a clear description of changes and link related issues.
- Install git hooks once: `node ops/scripts/install-git-hooks.mjs`.

## Adding a New Skill

1. Create `skills/<name>/SKILL.md` with YAML frontmatter (name, description, version).
2. Add TypeScript in `skills/<name>/scripts/` if applicable.
3. Register in `.claude-plugin/marketplace.json` under the `super-creator` plugin.
4. See [docs/creating-skills.md](docs/creating-skills.md) for full requirements.

## Release

Automated via `/release-skills`. Never manually edit version files. Process: create `release/x.y.z` branch from `develop`, run `/release-skills --dry-run` to preview, then `/release-skills` to execute. Updates `marketplace.json`, `CHANGELOG.md`, `CHANGELOG.zh.md`, creates tag.
