# Weibo Posting Types

## Regular Posts

Text + images/videos (max 18 files total). Posted on Weibo homepage.

```bash
./sc-run post-to-weibo weibo-post "Hello Weibo!" --image ./photo.png
```

**Parameters**:
| Parameter | Description |
|-----------|-------------|
| `<text>` | Post content (positional) |
| `--image <path>` | Image file (repeatable) |
| `--video <path>` | Video file (repeatable) |
| `--profile <dir>` | Custom Chrome profile |

**Note**: Script opens browser with content filled in. User reviews and publishes manually.

---

## Headline Articles (头条文章)

Long-form Markdown articles published at `https://card.weibo.com/article/v3/editor`.

```bash
./sc-run post-to-weibo weibo-article article.md
```

**Parameters**:
| Parameter | Description |
|-----------|-------------|
| `<markdown>` | Markdown file (positional) |
| `--cover <path>` | Cover image |
| `--title <text>` | Override title (max 32 chars, truncated if longer) |
| `--summary <text>` | Override summary (max 44 chars, auto-regenerated if longer) |
| `--profile <dir>` | Custom Chrome profile |

**Character Limits**:
- Title: 32 characters max (truncated with warning if longer)
- Summary/导语: 44 characters max (auto-regenerated from content if longer)

**Article Workflow**:
1. Opens editor
2. Fills title and summary
3. Inserts HTML content via paste
4. Replaces image placeholders one by one

**Post-Composition Check**: The script automatically verifies after all images are inserted:
- Remaining `WBIMGPH_` placeholders in editor content
- Expected vs actual image count
