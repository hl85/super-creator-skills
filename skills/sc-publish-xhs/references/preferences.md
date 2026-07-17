# Preferences — Publish to Xiaohongshu

## EXTEND.md

Check for preferences in order:
- `.super-creator/publish-xhs/EXTEND.md` (project)
- `$HOME/.super-creator/publish-xhs/EXTEND.md` (user)

## Supported Options

| Key | Default | Description |
|-----|---------|-------------|
| `DEFAULT_TAGS` | (none) | Default hashtag topics added to every note |
| `DEFAULT_LOCATION` | (none) | Default city/location tag |
| `DRAFT_MODE` | `true` | Set `false` to auto-publish without confirmation prompt |
| `CHROME_PROFILE_DIR` | (platform default) | Override shared Chrome profile path |

## Chrome Profile Path

Uses the shared super-creator Chrome profile. See [chrome-profile.md](chrome-profile.md) for paths per OS.
Override per-skill via `SC_CHROME_PROFILE_DIR` env var or `CHROME_PROFILE_DIR` in EXTEND.md.
