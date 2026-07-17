# Weibo Preferences & Prerequisites

## Preferences (EXTEND.md)

Check EXTEND.md existence (priority order):

1. **Project-level**: `.super-creator/post-to-weibo/EXTEND.md`
2. **XDG Config**: `${XDG_CONFIG_HOME:-$HOME/.config}/super-creator/post-to-weibo/EXTEND.md`
3. **User-level**: `$HOME/.super-creator/post-to-weibo/EXTEND.md`

**EXTEND.md Supports**:
- `chrome_profile_path`: Default Chrome profile path

## Prerequisites

- Google Chrome or Chromium
- `bun` runtime
- First run: log in to Weibo manually (session saved)
- All scripts only fill content into the browser; user must review and publish manually.
