# Creating New Skills

**REQUIRED READING**: [Skill authoring best practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices)

## Key Requirements

| Requirement | Details |
|-------------|---------|
| **Naming** | All skills MUST use descriptive names without a required prefix |
| **name field** | Max 64 chars, lowercase letters/numbers/hyphens only, no "anthropic"/"claude" |
| **description** | Max 1024 chars, third person, include what + when to use |
| **SKILL.md body** | Keep under 500 lines; use `references/` for additional content |
| **References** | One level deep from SKILL.md; avoid nested references |

## SKILL.md Frontmatter Template

```yaml
---
name: <name>
description: <Third-person description. What it does + when to use it.>
version: <semver matching marketplace.json>
metadata:
  openclaw:
    homepage: https://github.com/hl85/supercreator#<name>
    requires:          # include only if skill has scripts
      anyBins:
        - bun
        - npx
---
```

## Steps

1. Create `skills/<name>/SKILL.md` with YAML front matter
2. Add TypeScript in `skills/<name>/scripts/` (if applicable)
3. Add prompt templates in `skills/<name>/prompts/` if needed
4. Register the skill in `.claude-plugin/marketplace.json` under the `supercreator` plugin entry
5. Add Script Directory section to SKILL.md if skill has scripts
6. Add openclaw metadata to frontmatter

## Skill Grouping

All skills are registered under the single `supercreator` plugin. Use these logical groups when deciding where the skill should appear in the docs:

| If your skill... | Use group |
|------------------|-----------|
| Generates visual content (images, slides, comics) | Content Skills |
| Publishes to platforms (X, WeChat, Weibo) | Content Skills |
| Provides AI generation backend | AI Generation Skills |
| Converts or processes content | Utility Skills |

If you add a new logical group, update the docs that present grouped skills, but keep the skill registered under the single `supercreator` plugin entry.

## Writing Descriptions

**MUST write in third person**:

```yaml
# Good
description: Generates Xiaohongshu infographic series from content. Use when user asks for "小红书图片", "XHS images".

# Bad
description: I can help you create Xiaohongshu images
```

## Script Directory Template

Every SKILL.md with scripts MUST include:

```markdown
## Script Directory

**Important**: All scripts are located in the `scripts/` subdirectory of this skill.

**Agent Execution Instructions**:
1. Determine this SKILL.md file's directory path as `{baseDir}`
2. Script path = `{baseDir}/scripts/<script-name>.ts`
3. Resolve `${BUN_X}` runtime: if `bun` installed → `bun`; if `npx` available → `npx -y bun`; else suggest installing bun
4. Replace all `{baseDir}` and `${BUN_X}` in this document with actual values

**Script Reference**:
| Script | Purpose |
|--------|---------|
| `scripts/main.ts` | Main entry point |
```

## Progressive Disclosure

For skills with extensive content:

```
skills/example/
├── SKILL.md              # Main instructions (<500 lines)
├── references/
│   ├── styles.md         # Loaded as needed
│   └── examples.md       # Loaded as needed
└── scripts/
    └── main.ts
```

Link from SKILL.md (one level deep only):
```markdown
**Available styles**: See [references/styles.md](references/styles.md)
```

## Extension Support (EXTEND.md)

Every SKILL.md MUST include EXTEND.md loading. Add as Step 1.1 (workflow skills) or "Preferences" section (utility skills):

```markdown
**1.1 Load Preferences (EXTEND.md)**

Check EXTEND.md existence (priority order):

\`\`\`bash
test -f .supercreator/<skill-name>/EXTEND.md && echo "project"
test -f "${XDG_CONFIG_HOME:-$HOME/.config}/supercreator/<skill-name>/EXTEND.md" && echo "xdg"
test -f "$HOME/.supercreator/<skill-name>/EXTEND.md" && echo "user"
\`\`\`

| Path | Location |
|------|----------|
| `.supercreator/<skill-name>/EXTEND.md` | Project directory |
| `$XDG_CONFIG_HOME/supercreator/<skill-name>/EXTEND.md` | XDG config (~/.config) |
| `$HOME/.supercreator/<skill-name>/EXTEND.md` | User home (legacy) |

| Result | Action |
|--------|--------|
| Found | Read, parse, display summary |
| Not found | Ask user with AskUserQuestion |
```

End of SKILL.md should include:
```markdown
## Extension Support
Custom configurations via EXTEND.md. See **Step 1.1** for paths and supported options.
```
