---
name: post-to-xhs
description: Posts image-text notes (图文笔记) to Xiaohongshu (小红书 / RedNote / XHS) via xiaohongshu-mcp (preferred) or Chrome CDP automation. Accepts a set of images (typically from xhs-images) and a caption, then publishes as a new note. Supports cover image selection, topic tags, and location tagging. Use when user asks to "发小红书", "post to XHS", "发红书", "post to RedNote", "xiaohongshu-mcp 发布", "MCP 发小红书", or has xhs-images output ready to publish.
version: 1.2.0
---

# Post to Xiaohongshu (小红书)

Publishes image-text notes (图文笔记) to Xiaohongshu via xiaohongshu-mcp (preferred) or Chrome CDP browser automation.

## Usage

All commands use `./sc-run post-to-xhs <script>`.

**发布方式优先级**：xiaohongshu-mcp → Chrome CDP 脚本 → 手动发布手册

```bash
# MCP 方式发布（优先）
./sc-run post-to-xhs mcp-publish --title "标题" --caption "正文" --images img1.png,img2.png

# CDP 方式发布（降级）
./sc-run post-to-xhs cdp-publish --title "标题" --caption "正文" --images img1.png,img2.png
```

## Intents

- **图文发布**：发布图片+文案笔记到小红书
- **MCP 集成**：通过 xiaohongshu-mcp 服务自动化发布
- **CDP 降级**：MCP 不可用时通过 Chrome 自动化发布
- **草稿预览**：预览模式人工确认后发布

## Progressive Disclosure

For detailed integration guides, tool references, and troubleshooting, see:

- [references/mcp-integration.md](references/mcp-integration.md) - **MCP 集成详情、工具列表、完整参数 Schema、故障排查**
- [references/cdp-guide.md](references/cdp-guide.md) - **CDP 架构说明、选择器参考、完整操作步骤、故障排查**
- [references/posting-guide.md](references/posting-guide.md) - **发布指南、笔记组成规则、首次登录流程**
- [references/preferences.md](references/preferences.md) - **EXTEND.md 配置、默认标签、Chrome Profile 路径**

## Error Handling

See [references/mcp-integration.md](references/mcp-integration.md) for MCP connection recovery and fallback strategies.
