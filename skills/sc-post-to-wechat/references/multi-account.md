# WeChat Multi-Account Support

EXTEND.md supports managing multiple WeChat Official Accounts. When `accounts:` block is present, each account can have its own credentials, Chrome profile, and default settings.

## Compatibility Rules

| Condition | Mode | Behavior |
|-----------|------|----------|
| No `accounts` block | Single-account | Current behavior, unchanged |
| `accounts` with 1 entry | Single-account | Auto-select, no prompt |
| `accounts` with 2+ entries | Multi-account | Prompt to select before publishing |
| `accounts` with `default: true` | Multi-account | Pre-select default, user can switch |

## Multi-account EXTEND.md Example

```md
default_theme: default
default_color: blue

accounts:
  - name: 宝玉的技术分享
    alias: baoyu
    default: true
    default_publish_method: api
    default_author: 宝玉
    need_open_comment: 1
    only_fans_can_comment: 0
    app_id: your_wechat_app_id
    app_secret: your_wechat_app_secret
  - name: AI工具集
    alias: ai-tools
    default_publish_method: browser
    default_author: AI工具集
    need_open_comment: 1
    only_fans_can_comment: 0
```

## Per-account Keys
Can be set per-account or globally as fallback:
`default_publish_method`, `default_author`, `need_open_comment`, `only_fans_can_comment`, `app_id`, `app_secret`, `chrome_profile_path`

## Global-only Keys
Always shared across accounts:
`default_theme`, `default_color`

## Account Selection (Step 0.5)

Insert between Step 0 and Step 1 in the Article Posting Workflow:

```
if no accounts block:
    → single-account mode (current behavior)
elif accounts.length == 1:
    → auto-select the only account
elif --account <alias> CLI arg:
    → select matching account
elif one account has default: true:
    → pre-select, show: "Using account: <name> (--account to switch)"
else:
    → prompt user:
      "Multiple WeChat accounts configured:
       1) <name1> (<alias1>)
       2) <name2> (<alias2>)
       Select account [1-N]:"
```

## Credential Resolution (API Method)

For a selected account with alias `{alias}`:

1. `app_id` / `app_secret` inline in EXTEND.md account block
2. Env var `WECHAT_{ALIAS}_APP_ID` / `WECHAT_{ALIAS}_APP_SECRET` (alias uppercased, hyphens → underscores)
3. `.super-creator/.env` with prefixed key `WECHAT_{ALIAS}_APP_ID`
4. `~/.super-creator/.env` with prefixed key
5. Fallback to unprefixed `WECHAT_APP_ID` / `WECHAT_APP_SECRET`

**.env multi-account example**:

```bash
# Account: baoyu
WECHAT_BAOYU_APP_ID=your_wechat_app_id
WECHAT_BAOYU_APP_SECRET=your_wechat_app_secret

# Account: ai-tools
WECHAT_AI_TOOLS_APP_ID=your_ai_tools_wechat_app_id
WECHAT_AI_TOOLS_APP_SECRET=your_ai_tools_wechat_app_secret
```

## Chrome Profile (Browser Method)

Each account uses an isolated Chrome profile for independent login sessions:

| Source | Path |
|--------|------|
| Account `chrome_profile_path` in EXTEND.md | Use as-is |
| Auto-generated from alias | `{shared_profile_parent}/wechat-{alias}/` |
| Single-account fallback | Shared default profile (current behavior) |

## CLI `--account` Argument

All publishing scripts accept `--account <alias>`:

```bash
./sc-run sc-post-to-wechat wechat-api <file> --theme default --account ai-tools
./sc-run sc-post-to-wechat wechat-article --markdown <file> --theme default --account baoyu
./sc-run sc-post-to-wechat wechat-browser --markdown <file> --images ./photos/ --account baoyu
```
