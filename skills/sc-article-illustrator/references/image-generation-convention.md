# Image Generation Convention

## Backend Priority (v3.4.0+)

**严格遵循以下优先级选择图片生成引擎：**

| 优先级 | 引擎 | Skill | 说明 |
|--------|------|-------|------|
| 1（首选） | 网页 AI | `sc-web-ai` | 免费，效果好，优先使用 |
| 2（次选） | 官方 API | `sc-imagine` | 批量/需要 Key 时使用 |

完整策略文档：[../../../docs/image-generation-priority.md](../../../../docs/image-generation-priority.md)

## Decision Flow

```
需要生成图片
    ↓
browser_tabs 检查是否有已登录的 Gemini/ChatGPT 标签页？
    ├─ 是 → 使用 sc-web-ai（网页生图）
    │
    └─ 否 → 检查是否有 API Key？
            ├─ 有 → 使用 sc-imagine
            └─ 无 → 提示用户："请在 IDE 浏览器中打开 gemini.google.com 并登录（免费生图），或配置 API Key"
```

## Important Notes

- **禁止默认使用混元 DashScope**：效果不佳，已从自动 fallback 中移除
- **优先推荐网页方式**：免费、无需配置、Nano Banana 风格适合文章插画
- **批量生成（3张以上）**：建议切换到 sc-imagine API 方式，效率更高
- **风格参考图**：需要风格一致性时，sc-imagine API 方式支持 `--ref` 参数更稳定

## Prompt Files

**Every generated image must have its complete prompt written to a dedicated `prompts/NN-*.md` file BEFORE generation.**

- Prompt file naming: `prompts/NN-{type}-{slug}.md` (e.g., `01-illustration-intro.md`)
- The generation command should use the prompt file rather than passing inline prompt text.
- Do NOT pass ad-hoc inline text to `--prompt` without first saving the prompt file.

## Batch Generation

Article illustrations support batch mode for efficiency:

1. Build batch file: `./sc-run sc-article-illustrator build-batch --input article.md`
2. Generate all images (API mode): `./sc-run sc-imagine main --batchfile prompts/batch.json`
3. Single images: prefer sc-web-ai for free, high-quality generation

## Generation Commands

### 使用 sc-web-ai（首选，网页方式）

不需要命令行，自然语言描述即可。AI 会自动操作浏览器完成生图和下载。

### 使用 sc-imagine（次选，API 方式）

单张生成：
```bash
./sc-run sc-imagine main --promptfile prompts/01-illustration-intro.md --image 01-illustration-intro.png
```

批量生成：
```bash
./sc-run sc-imagine main --batchfile prompts/batch.json
```
