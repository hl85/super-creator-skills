## Naming Decisions
- baoyu-skills → supercreator (plugin name)
- baoyu-{skill} → {skill} (drop prefix from skill dirs)
- baoyu-md → sc-md (sc- prefix to avoid generic name conflict)
- baoyu-fetch → sc-fetch
- baoyu-chrome-cdp → sc-chrome-cdp
- .baoyu-skills/ → .supercreator/ (runtime config dir)
- BAOYU_ → SC_ (env var prefix)
- Git remote: fix from suppercreator (double p) → supercreator (single p)
- Fork attribution: README only

## Architecture Decisions
- Do NOT modify vendor sync script logic (scripts/sync-shared-skill-packages.mjs)
- Do NOT modify workspace glob "packages/*" - it auto-discovers
- Do NOT add new tests - only update existing test expectations
- Tasks 2-4 do NOT modify vendor copies (Task 5 handles that)
- Tasks 2-4 do NOT change runtime paths (Task 10 handles that)
- Tasks 2-4 do NOT change env vars (Task 11 handles that)
