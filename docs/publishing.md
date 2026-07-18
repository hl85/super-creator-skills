# ClawHub / OpenClaw Publishing

## OpenClaw Metadata

Skills include `metadata.openclaw` in YAML front matter:

```yaml
metadata:
  openclaw:
    homepage: https://github.com/hl85/supercreator#<skill-name>
    requires:          # only for skills with scripts
      anyBins:
        - bun
        - npx
```

## Publishing Commands

```bash
bash scripts/sync-clawhub.sh           # sync all skills
bash scripts/sync-clawhub.sh <skill>   # sync one skill
```

Release hooks are configured via `.releaserc.yml`. This repo does not stage a separate release directory: release prep only syncs `packages/` into each skill's committed `scripts/vendor/`, and publish reads the skill directory directly.

## Shared Workspace Packages

`packages/` is the **only** source of truth. Never edit `skills/*/scripts/vendor/` directly.

Current packages:
- `sc-chrome-cdp` (Chrome CDP utilities), consumed by 6 skills (`danger-gemini-web`, `danger-x-to-markdown`, `post-to-wechat`, `post-to-weibo`, `post-to-x`, `url-to-markdown`)
- `sc-md` (shared Markdown rendering and placeholder pipeline), consumed by 3 skills (`markdown-to-html`, `post-to-wechat`, `post-to-weibo`)

**How it works**: Sync script copies packages into each consuming skill's `vendor/` directory and rewrites dependency specs to `file:./vendor/<name>`. Vendor copies are committed to git, making skills self-contained.

**Update workflow**:
1. Edit package under `packages/`
2. Run `node scripts/sync-shared-skill-packages.mjs`
3. Commit synced `vendor/`, `package.json`, and `bun.lock` together

**Git hook**: Run `node scripts/install-git-hooks.mjs` once to enable the `pre-push` hook. It re-syncs and blocks push if vendor copies are stale (`--enforce-clean`).
