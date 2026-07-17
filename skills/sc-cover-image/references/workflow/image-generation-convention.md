# Image Generation Convention

## Backend Priority (v3.4.0+)

**严格遵循以下优先级选择图片生成引擎：**

| 优先级 | 引擎 | Skill | 说明 |
|--------|------|-------|------|
| 1（首选） | 网页 AI | `sc-web-ai` | 免费，效果好，优先使用 |
| 2（次选） | 官方 API | `sc-imagine` | 需要特定尺寸/Key 时使用 |


完整策略文档：[../../../../docs/image-generation-priority.md](../../../../../docs/image-generation-priority.md)

## Decision Flow

```
需要生成封面图
    ↓
browser_tabs 检查是否有已登录的 Gemini/ChatGPT 标签页？
    ├─ 是 → 使用 sc-web-ai（网页生图）
    │
    └─ 否 → 检查是否有 API Key？
            ├─ 有 → 使用 sc-imagine（指定 --ar 2.35:1 等尺寸参数）
            └─ 无 → 提示用户："请在 IDE 浏览器中打开 gemini.google.com 并登录（免费生图），或配置 API Key"
```

## Important Notes

- **优先推荐网页方式**：免费、无需配置
- **封面图尺寸**：sc-imagine 支持 `--ar 2.35:1` 精确控制公众号封面尺寸
- **风格参考**：需要参考图时，sc-imagine 支持 `--ref` 参数

## Prompt Files

**Every generated image must have its complete prompt written to a dedicated `prompts/NN-*.md` file BEFORE generation.**

- Prompt file naming: `prompts/01-cover-{slug}.md`
- The generation command should use `--promptfile prompts/01-cover-{slug}.md` (or equivalent) rather than passing inline prompt text.
- Do NOT pass ad-hoc inline text to `--prompt` without first saving the prompt file.

## Generation Commands

### 使用 sc-web-ai（首选，网页方式）

不需要命令行，自然语言描述即可，明确说明"公众号封面图，2.35:1 比例"。AI 会自动操作浏览器完成生图和下载。

### 使用 sc-imagine（次选，API 方式）

封面图（2.35:1 比例）：
```bash
./sc-run sc-imagine main --promptfile prompts/01-cover-{slug}.md --ar 2.35:1 --image 01-cover-{slug}.png
```

带参考图：
```bash
./sc-run sc-imagine main --promptfile prompts/01-cover-{slug}.md --ref refs/ref-01-{slug}.jpg --ar 2.35:1 --image 01-cover-{slug}.png
```
