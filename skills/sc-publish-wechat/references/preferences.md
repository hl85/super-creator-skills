# WeChat Preferences & Configuration

This document covers the configuration options for the `sc-publish-wechat` skill.

## EXTEND.md Preferences

The `sc-publish-wechat` skill supports custom configuration via `EXTEND.md`.

### File Location Resolution

The skill checks for `EXTEND.md` in the following locations (priority order):

1.  **Project-level**: `.super-creator/publish-wechat/EXTEND.md`
2.  **XDG Config**: `${XDG_CONFIG_HOME:-$HOME/.config}/super-creator/publish-wechat/EXTEND.md`
3.  **User-level**: `$HOME/.super-creator/publish-wechat/EXTEND.md`

### Supported Keys

| Key | Default | Description |
|-----|---------|-------------|
| `default_theme` | `default` | Default theme (default, grace, simple, modern) |
| `default_color` | - | Default color preset or hex value |
| `default_publish_method` | - | `api` or `browser` |
| `default_author` | - | Fallback for `author` |
| `need_open_comment` | `1` | `articles[].need_open_comment` (1/0 or true/false) |
| `only_fans_can_comment` | `0` | `articles[].only_fans_can_comment` (1/0 or true/false) |
| `chrome_profile_path` | - | Custom Chrome profile path |

### Multi-Account Support

See [references/multi-account.md](multi-account.md) for details on managing multiple WeChat Official Accounts.

## Prerequisites

### For API method:
- WeChat Official Account API credentials (AppID and AppSecret)
- Credentials should be stored in environment variables or `.env` files:
  - `WECHAT_APP_ID`
  - `WECHAT_APP_SECRET`

### For Browser method:
- Google Chrome installed
- First run: manual QR code scan required to log in (session persists)

### Environment Variables
- `WECHAT_BROWSER_CHROME_PATH`: Custom path to Chrome binary
- `WECHAT_APP_ID`, `WECHAT_APP_SECRET`: API credentials
