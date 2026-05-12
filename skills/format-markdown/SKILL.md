---
name: format-markdown
description: Formats plain text or markdown files with frontmatter, titles, summaries, headings, bold, lists, and code blocks. Use when user asks to "format markdown", "beautify article", "add formatting", or improve article layout. Outputs to {filename}-formatted.md.
version: 1.57.0
---

# Markdown Formatter

Transforms plain text or markdown into well-structured, reader-friendly content without changing original meaning.

## Usage

All commands use `./sc-run format-markdown <script>`.

```bash
# Standard typography cleanup
./sc-run format-markdown main article.md

# Cleanup with quote replacement
./sc-run format-markdown main article.md --quotes

# Full formatting workflow
./sc-run format-markdown main article.md --optimize
```

## Intents

- **Typography Cleanup**: Fix CJK/English spacing, quotes, and punctuation emphasis.
- **Content Analysis**: Identify key insights, structure, and reader-important info.
- **Structural Formatting**: Add headings, bolding, lists, and tables to improve scannability.
- **Frontmatter Management**: Generate titles, slugs, and summaries.

## Progressive Disclosure

For detailed formatting principles, title formulas, and step-by-step workflows, see:

- [references/workflow.md](references/workflow.md) - **Full Formatting Workflow**
- [references/title-formulas.md](references/title-formulas.md) - **High-Hook Title Patterns**
- [references/preferences.md](references/preferences.md) - **EXTEND.md Options**
- [references/technical-details.md](references/technical-details.md) - **Typography Script Options**
