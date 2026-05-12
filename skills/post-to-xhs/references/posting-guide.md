# Posting Guide — Xiaohongshu

## Chrome CDP Prerequisites

Post-to-XHS uses Chrome CDP (same profile as post-to-wechat, post-to-weibo, post-to-x).
See `docs/chrome-profile.md` for platform-specific profile paths.

First-time login:
1. Open Chrome with the shared super-creator profile.
2. Navigate to https://www.xiaohongshu.com and log in manually.
3. Cookies are persisted in the profile for future runs.

## Note Composition Rules

| Field | Limit | Notes |
|-------|-------|-------|
| Caption | 1000 chars | Plain text; `#话题` inline for tags |
| Images | 1–9 | JPG/PNG/WebP; max 10MB each |
| Cover | 1 | Defaults to first image |
| Tags | up to 5 | Can be set inline via `#tag` or `--tags` flag |
| Location | optional | City-level granularity |

## Prompt-Driven Workflow

Because this skill is prompt-driven (Beta), the agent will:
1. Ask the user to confirm images and caption before proceeding.
2. Open Chrome to the XHS creator page.
3. Guide through upload steps interactively if CDP automation is unavailable.
4. Preview the note and ask for publish confirmation.

## Known Limitations (Beta)

- Full CDP automation script not yet implemented; agent performs guided manual steps.
- Video notes (视频笔记) not yet supported — image notes only.
- Scheduled publishing not supported.
