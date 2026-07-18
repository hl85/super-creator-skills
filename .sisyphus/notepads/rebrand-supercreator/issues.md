## Known Issues/Gotchas

- packages/sc-md/src/extend-config.ts has "baoyu-markdown-to-html" path - leave for Task 10
- packages/sc-fetch/src/browser/profile.ts has appDataDirName = "baoyu-skills" - leave for Task 10
- packages/sc-chrome-cdp/src/index.ts has appDataDirName = "baoyu-skills" - leave for Task 10
- packages/sc-chrome-cdp/src/index.test.ts may have BAOYU_* env var refs - leave for Task 11
- Tasks 2-4 must NOT touch vendor copies inside skills/ - that is Task 5's job
- Pre-push hook (.githooks/pre-push) validates vendor consistency - must pass after Task 5
- Dynamic env var template string: `BAOYU_IMAGE_GEN_${provider}_CONCURRENCY` must become `SC_IMAGE_GEN_${provider}_CONCURRENCY`
