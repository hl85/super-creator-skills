# Chrome Profile

All CDP skills share a single profile directory. Do NOT create per-skill profiles.

Override: `SC_CHROME_PROFILE_DIR` env var (takes priority over all defaults). Set in `~/.super-creator/.env` for user-level override.

| Platform | Default Path |
|----------|-------------|
| macOS | `~/Library/Application Support/super-creator/chrome-profile` |
| Linux | `$XDG_DATA_HOME/super-creator/chrome-profile` (fallback `~/.local/share/`) |
| Windows | `%APPDATA%/super-creator/chrome-profile` |
| WSL | Windows home `/.local/share/super-creator/chrome-profile` |

New skills: use `SC_CHROME_PROFILE_DIR` only (not per-skill env vars like `X_BROWSER_PROFILE_DIR`).

## Implementation Pattern

```typescript
function getDefaultProfileDir(): string {
  const override = process.env.SC_CHROME_PROFILE_DIR?.trim();
  if (override) return path.resolve(override);
  const base = process.platform === 'darwin'
    ? path.join(os.homedir(), 'Library', 'Application Support')
    : process.env.XDG_DATA_HOME || path.join(os.homedir(), '.local', 'share');
  return path.join(base, 'super-creator', 'chrome-profile');
}
```
