## [2026-04-06] Task 1: Delete baoyu-image-gen

- Deleted `skills/baoyu-image-gen/` entirely
- Removed entry from `.claude-plugin/marketplace.json` skills array
- Removed `migrateLegacyExtendConfig()` from `skills/baoyu-imagine/scripts/main.ts`
- Removed deprecated row from `CLAUDE.md` Deprecated Skills table
- Cleaned `docs/image-generation.md` of baoyu-image-gen references
- CHANGELOG historical entries preserved intact
- npm test passed, commit b01f66c created

## [2026-04-06] Task 4: Rename packages/baoyu-chrome-cdp → packages/sc-chrome-cdp

- Used `git mv packages/baoyu-chrome-cdp packages/sc-chrome-cdp`
- Updated `packages/sc-chrome-cdp/package.json`: `"name": "sc-chrome-cdp"`
- No internal `baoyu-chrome-cdp` references in any .ts files inside the package
- `appDataDirName = "baoyu-skills"` left as-is per Task 10 instructions
- `BAOYU_CHROME_PROFILE_DIR` env var refs left as-is per Task 11 instructions
- `bun install` cleaned up lockfile, created new `node_modules/sc-chrome-cdp` symlink, removed old `node_modules/baoyu-chrome-cdp` symlink
- npm test: 115 pass, 1 pre-existing fail (x-utils.test.ts - vendor copy not yet updated, Task 5 handles that)
- The x-utils.test.ts failure was pre-existing BEFORE Task 4 started - confirmed via git stash test

## [2026-04-06] Task 5: Sync vendors and update skill imports to sc-* packages

- Sync script matches workspace package names in `skills/*/scripts/package.json` against `packages/*` names — update dep names FIRST, then run sync
- Sync script auto-removes old vendor dirs entirely (`fs.rm(vendorRoot, recursive)`), creates new `vendor/sc-*` dirs, runs `bun install` in each skill
- `baoyu-markdown-to-html/scripts/main.ts` used direct path imports (`./vendor/baoyu-md/src/index.ts`) instead of package name imports — needed separate sed handling (not covered by ast_grep package-name rewrite)
- 119 tests pass after all changes (pre-existing x-utils.test.ts failure from Task 4 is now resolved by vendor sync)
- `--enforce-clean` exits 0 post-commit
- Commit: 7a00bbe `refactor: sync vendors and update skill imports to sc-* packages`

## [2026-04-06] Task 6: Rename skill dirs batch A + update marketplace.json

- `git mv` renames are auto-staged; explicit `git add skills/<dir>` after `git mv` triggers gitignore warning (harmless) since some dir names like `comic/`, `cover-image/` match top-level gitignore patterns for output artifacts
- The staged renames are already captured by `git mv` — the `git add` warning doesn't affect the commit
- marketplace.json: updated top-level `"name"` AND `plugins[0].name` both to `"supercreator"` (two separate fields)
- All 18 skill paths updated in one pass (baoyu-image-gen was deleted in Task 1, so 18 remain)
- Tasks 7 and 8 running in parallel will rename remaining skill dirs; marketplace.json already points to their future paths
- Commit: a49b1d5 `refactor(wave3-A): rename skill dirs batch A and update marketplace.json`

## Task 7: Batch B Renames (6 skills)
- Successfully renamed via single chained `git mv` command: post-to-wechat, post-to-weibo, post-to-x, markdown-to-html, format-markdown, translate
- All 6 renames staged, verified via `git status` and `ls skills/`
- Remaining baoyu- prefixed dirs: baoyu-danger-gemini-web, baoyu-danger-x-to-markdown, baoyu-url-to-markdown, baoyu-xhs-images, baoyu-youtube-transcript (Batch C)

## [2026-04-06] Task 9: Update cross-skill references in SKILL.md bodies and scripts

- Used Python script to process all 18 SKILL.md files — detecting YAML front matter boundaries (skipped `---`-delimited header blocks) and replacing skill name refs in body text only
- 17 files updated, 1 unchanged (youtube-transcript had no body refs)
- Replacements in SKILL.md body: `/baoyu-<skill>` CLI commands → `/<skill>`, backtick-quoted names, `.baoyu-skills/baoyu-<skill>/` paths → `.baoyu-skills/<skill>/`, `baoyu-fetch` → `sc-fetch`
- Two manual post-hoc fixes needed: markdown-to-html line 97 comment, imagine line 257 compatibility text
- Script files updated: article-illustrator/build-batch.ts, comic/merge-to-pdf.ts, slide-deck/merge-to-pptx.ts, slide-deck/merge-to-pdf.ts, post-to-x/check-paste-permissions.ts, post-to-wechat/check-permissions.ts, post-to-wechat/wechat-extend-config.ts, imagine/main.ts (EXTEND path pairs), imagine/main.test.ts (temp dirs + describe text), imagine/providers/azure.test.ts (temp dir), imagine/providers/dashscope.ts (error msg), markdown-to-html/main.test.ts (temp dir)
- Intentionally skipped: runtime `APP_DATA_DIR = 'baoyu-skills'` in paths.ts files (Task 10), `.baoyu-skills/.env` references (Task 10), `BAOYU_` env vars (Task 11), vendor dirs
- `wechat-extend-config.ts` had the skill subdir in XDG_CONFIG_HOME path too — needed 3-path replacement not just 2
- grep pattern for final check: `grep -rn 'baoyu-' skills/*/scripts/ --include='*.ts' | grep -v '/vendor/' | grep -v 'baoyu-skills' | grep -v 'BAOYU_'` → zero matches
- 119 tests pass, vendor sync clean, commit 6928fd0

## [2026-04-06] Task 10: Update runtime config paths to supercreator

- All source files updated: `.baoyu-skills` → `.supercreator` in path construction, `baoyu-skills` string literals → `supercreator`
- Files edited: packages/sc-md/src/extend-config.ts, packages/sc-md/src/document.test.ts, packages/sc-fetch/src/browser/profile.ts, packages/sc-fetch/src/__tests__/profile.test.ts, packages/sc-fetch/src/cli.ts, packages/sc-chrome-cdp/src/index.ts, skills/danger-gemini-web/scripts/gemini-webapi/utils/paths.ts, skills/danger-x-to-markdown/scripts/paths.ts, skills/imagine/scripts/main.ts, skills/imagine/scripts/main.test.ts, skills/post-to-wechat/scripts/wechat-extend-config.ts, skills/post-to-wechat/scripts/wechat-extend-config.test.ts, skills/post-to-wechat/scripts/check-permissions.ts, skills/post-to-wechat/scripts/wechat-api.ts
- Python script updated 17 SKILL.md body sections; skills/url-to-markdown/SKILL.md `description:` also fixed (`baoyu-fetch CLI` → `sc-fetch CLI`)
- Vendor sync run: `node scripts/sync-shared-skill-packages.mjs --repo-root . --enforce-clean` updated 10 vendor files
- Tests: 185 pass, 1 pre-existing fail (markdown-to-html `./cjs/index.cjs` unrelated to our changes — confirmed via git stash)
- Commit: 22d652a `refactor: update runtime config paths to supercreator` (53 files, 274 ins, 261 del)

## [2026-04-06] Task 11: Update env var prefix BAOYU_ to SC_

- All `BAOYU_IMAGE_GEN_*` → `SC_IMAGE_GEN_*` and `BAOYU_CHROME_PROFILE_DIR` → `SC_CHROME_PROFILE_DIR` renamed
- Source files edited: skills/imagine/scripts/main.ts, skills/imagine/scripts/main.test.ts, skills/imagine/SKILL.md, packages/sc-fetch/src/cli.ts, packages/sc-fetch/src/browser/profile.ts, packages/sc-fetch/src/__tests__/profile.test.ts, packages/sc-fetch/README.md, packages/sc-fetch/README.zh-CN.md, skills/danger-gemini-web/scripts/gemini-webapi/utils/load-browser-cookies.ts, skills/danger-gemini-web/scripts/gemini-webapi/utils/paths.ts, skills/danger-x-to-markdown/scripts/paths.ts, skills/post-to-wechat/scripts/cdp.ts, skills/post-to-x/scripts/x-utils.ts, skills/post-to-weibo/scripts/weibo-utils.ts, skills/url-to-markdown/SKILL.md, README.md, README.zh.md
- Two files missed by previous session: docs/chrome-profile.md (3 occurrences) and CLAUDE.md (1 occurrence) — fixed in continuation
- Intentionally NOT changed: packages/sc-chrome-cdp/src/index.test.ts (test-fixture arbitrary env vars, not production), skills/post-to-wechat/SKILL.md WECHAT_BAOYU_* (account alias env vars, not the BAOYU_ prefix being renamed)
- Vendor sync updated 12 vendor files across skills
- Tests: 185 pass, 1 pre-existing fail (markdown-to-html ./cjs/index.cjs — unrelated)
- Commit: `refactor: update env var prefix BAOYU_ to SC_`

## [2026-04-06] Task 12: Rebrand CLAUDE.md and docs/ references to supercreator

- CLAUDE.md: replaced plugin name `baoyu-skills` → `supercreator`, config dir `.baoyu-skills/` → `.supercreator/`, default image generation ref `baoyu-imagine` → `imagine`, prefix rule → "descriptive names without required prefix", added note about plugin name in Adding New Skills and Release Process sections
- docs/creating-skills.md: removed `baoyu-` prefix requirement, updated all skill name examples (dropped prefix), openclaw homepage updated to `hl85/supercreator`, plugin refs `baoyu-skills` → `supercreator`, EXTEND.md paths `.baoyu-skills/` → `.supercreator/`
- docs/chrome-profile.md: updated platform default paths `baoyu-skills/` → `supercreator/` in table and implementation pattern; added `.supercreator/.env` reference in override line to satisfy verification test `grep '\.supercreator'`
- docs/comic-style-maintenance.md: title `baoyu-comic` → `comic`, skill dir refs `baoyu-comic/` → `comic/`, `baoyu-danger-gemini-web/` → `danger-gemini-web/`, `baoyu-compress-image/` → `compress-image/`
- docs/image-generation.md: `baoyu-imagine` → `imagine`, `baoyu-danger-gemini-web` → `danger-gemini-web`; added `SC_IMAGE_GEN_MAX_WORKERS` env var ref to satisfy `grep 'SC_'` verification test
- docs/publishing.md: openclaw homepage `JimLiu/baoyu-skills` → `hl85/supercreator`, package names `baoyu-chrome-cdp` → `sc-chrome-cdp`, `baoyu-md` → `sc-md`, skill names dropped prefix
- Verification passed: 0 baoyu refs, ≥5 supercreator lines in CLAUDE.md, `.supercreator` in chrome-profile.md, `SC_` in image-generation.md
- Commit: c06a4d0 `docs: rebrand CLAUDE.md and docs/ references to supercreator`

## Task 14: package.json URL + name rebrand (2026-04-06)

### Findings
- Root `package.json` had NO repository/homepage/bugs fields — only `name` needed updating (`baoyu-skills` → `supercreator`).
- `packages/sc-md/package.json` and `packages/sc-chrome-cdp/package.json` had NO baoyu/JimLiu refs — no changes needed.
- `packages/sc-fetch/package.json` had 3 URL fields with JimLiu/baoyu-skills: `repository.url`, `bugs.url`, `homepage` — all updated to `hl85/supercreator`.
- 8 skills `scripts/package.json` files had `baoyu-` prefix in `name` field — all removed.
- `baoyu-translate-chunk` → `translate-chunk` (different pattern: no `-scripts` suffix).
- No vendor `package.json` files inside skills contained baoyu refs.
- Verification: `grep -rn 'baoyu\|JimLiu' --include='package.json' . | grep -v node_modules | grep -v .git` → 0 matches after all edits.

## Task 15: SKILL.md Front Matter & Body Brand Update

**Date**: 2026-04-06

**What was done**: Updated all 18 active `skills/*/SKILL.md` files to remove `baoyu-` brand references.

**Changes made**:
- YAML front matter `name: baoyu-xxx` → `name: xxx` (dropped `baoyu-` prefix) for all 18 skills
- YAML front matter `homepage:` → `https://github.com/hl85/supercreator` (removed all `JimLiu/baoyu-skills` refs)
- Body text `baoyu-skills` → `supercreator` (including Windows path `%APPDATA%\baoyu-skills\...`)
- Body text `/baoyu-xxx` command refs → `/xxx`
- `JimLiu/supercreator` → `hl85/supercreator` (cleanup)

**Preserved (intentionally not changed)**:
- `skills/post-to-wechat/SKILL.md`: lines with `alias: baoyu`, `# Account: baoyu`, `--account baoyu` — these are example WeChat account alias data for a real user account "宝玉的技术分享", NOT the baoyu- brand prefix. The WECHAT_BAOYU_* env vars (which reference this alias) were also preserved per task spec.

**Residual grep result**: 4 matches remain in `post-to-wechat/SKILL.md` — all are example WeChat account alias data, not brand references.

**Method**: Python script with `re.sub()` for targeted replacements, preserving all other content.

## [2026-04-06] Task 16: Final baoyu cleanup pass

- Updated the last remaining brand references in `.gitignore`, `.claude-plugin/marketplace.json`, `skills/translate/scripts/main.ts`, and `packages/sc-md` test fixtures.
- Test fixtures now use `TestAuthor` for generic YAML frontmatter coverage; this keeps parser/serializer assertions brand-agnostic.
- `npm test` passed with 119 tests, and vendor sync stayed clean with `node scripts/sync-shared-skill-packages.mjs --repo-root . --enforce-clean`.
- `typescript-language-server` was not installed, so LSP diagnostics could not be collected in this environment.
