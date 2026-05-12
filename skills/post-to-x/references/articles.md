# X Articles - Detailed Guide

Publish Markdown articles to X Articles editor with rich text formatting and images.

## Prerequisites

- X Premium subscription (required for Articles)
- Google Chrome installed
- `bun` installed

## Usage

```bash
# Publish markdown article (preview mode)
./sc-run post-to-x x-article article.md

# With custom cover image
./sc-run post-to-x x-article article.md --cover ./cover.jpg

# Actually publish
./sc-run post-to-x x-article article.md --submit
```

## Markdown Format

```markdown
---
title: My Article Title
cover_image: /path/to/cover.jpg
---

# Title (becomes article title)

Regular paragraph text with **bold** and *italic*.

## Section Header

More content here.

![Image alt text](./image.png)

- List item 1
- List item 2

1. Numbered item
2. Another item

> Blockquote text

[Link text](https://example.com)

```
Code blocks become blockquotes (X doesn't support code)
```
```

## Markdown to HTML Script

Convert markdown and inspect structure:

```bash
# Get JSON with all metadata
./sc-run post-to-x md-to-html article.md

# Output HTML only
./sc-run post-to-x md-to-html article.md --html-only

# Save HTML to file
./sc-run post-to-x md-to-html article.md --save-html /tmp/article.html
```

## Image Handling

1. **Cover Image**: First image or `cover_image` from frontmatter
2. **Remote Images**: Automatically downloaded to temp directory
3. **Placeholders**: Images in content use `XIMGPH_N` format
4. **Insertion**: Placeholders are found, selected, and replaced with actual images

## Post-Composition Check

The script automatically verifies after all images are inserted:
- Remaining `XIMGPH_` placeholders in editor content
- Expected vs actual image count

If the check fails (warnings in output), alert the user with the specific issues before they publish.

## Troubleshooting

- **No create button**: Ensure X Premium subscription is active
- **Cover upload fails**: Check file path and format (PNG, JPEG)
- **Images not inserting**: Verify placeholders exist in pasted content
- **Content not pasting**: Check HTML clipboard: `./sc-run post-to-x copy-to-clipboard html --file /tmp/test.html`
