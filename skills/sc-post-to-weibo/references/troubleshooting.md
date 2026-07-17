# Weibo Troubleshooting

## Chrome debug port not ready

If a script fails with `Chrome debug port not ready` or `Unable to connect`, kill only the CDP Chrome instances (those with `--remote-debugging-port` AND the super-creator profile), then retry:

```bash
pkill -f "remote-debugging-port.*super-creator/chrome-profile" 2>/dev/null; sleep 2
```

**CRITICAL**: Never kill all Chrome processes (`pkill -f "Google Chrome"`). Only kill Chrome instances launched by CDP with the super-creator profile directory.

**Important**: This should be done automatically by scripts when encountering this error.

## General Issues

- **Not logged in**: First run opens browser - manually scan QR code or log in.
- **Title/Summary truncation**: Headline articles have strict character limits (32 for title, 44 for summary).
- **Image placeholders**: If `WBIMGPH_` remains in the article, the image upload failed.
