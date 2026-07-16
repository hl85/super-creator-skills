---
name: post-to-xhs
description: Posts image-text notes (图文笔记) to Xiaohongshu (小红书 / RedNote / XHS) via xiaohongshu-mcp (preferred) or Chrome CDP automation. Accepts a set of images (typically from xhs-images) and a caption, then publishes as a new note. Supports cover image selection, topic tags, and location tagging. Use when user asks to "发小红书", "post to XHS", "发红书", "post to RedNote", "xiaohongshu-mcp 发布", "MCP 发小红书", or has xhs-images output ready to publish.
version: 1.2.0
---

# Post to Xiaohongshu (小红书)

Publishes image-text notes (图文笔记) to Xiaohongshu via xiaohongshu-mcp (preferred) or Chrome CDP browser automation.

## 触发场景

当用户出现以下需求时调用本技能：
- 发布小红书图文笔记
- 将生成的 xhs-images 图片发布到小红书
- 批量发布内容到小红书
- MCP / CDP 方式自动化发布

支持功能：图文笔记发布、封面选择、话题标签、位置标签、草稿预览。

## 发布方式对比

| 方式 | 优先级 | 说明 | 稳定性 |
|------|--------|------|--------|
| **xiaohongshu-mcp** | ⭐ 优先 | 本地 MCP 服务，`publish_content` 工具发布 | 高 |
| **Chrome CDP 脚本** | Fallback | TypeScript 脚本驱动 Chrome 自动化 | 中（DOM 可能变化） |

**自动降级逻辑**：MCP 不可用 → CDP 脚本 → 手动发布手册

### 方式选择逻辑

1. 首先尝试连接 xiaohongshu-mcp（默认地址 `http://localhost:18060/mcp`）
2. 如果 MCP 可用且已登录，使用 `publish_content` 工具发布
3. 如果 MCP 不可用或登录态失效，自动降级到 CDP 脚本
4. 如果 CDP 也失败，生成手动发布手册

---

## 快速开始

### MCP 方式（3 步）

1. **连接服务**：默认地址 `http://localhost:18060/mcp`，环境变量 `XIAOHONGSHU_MCP_URL` 可覆盖
2. **检查登录**：调用 `check_login_status` 确认登录状态，未登录则调用 `get_login_qrcode` 扫码
3. **发布笔记**：
   ```
   publish_content(
     title: "笔记标题",
     content: "正文内容",
     images: ["/path/to/img1.png", "/path/to/img2.png"],
     tags: ["标签1", "标签2"]
   )
   ```

### CDP 方式（3 步）

1. **首次登录**：运行脚本后 Chrome 启动，扫码登录小红书
2. **预览模式**（默认）：
   ```bash
   cd scripts && npx -y bun xhs-post.ts note \
     --title "标题" --caption "正文" \
     --image ./img1.png --tag 面试
   ```
3. **直接发布**：加 `--publish` 参数自动点击发布

---

## 核心规则

1. **优先 MCP**：始终优先使用 xiaohongshu-mcp，不可用时自动降级到 CDP
2. **图片要求**：1-9 张，JPG/PNG/WebP，单张 ≤ 10MB，第一张为封面
3. **标题限制**：建议 20 字以内，正文最多 1000 字
4. **标签规则**：最多 10 个话题标签，MCP 方式 `tags` 参数不带 `#`
5. **草稿模式**：CDP 默认预览模式（人工确认），加 `--publish` 直接发布
6. **绝对路径**：MCP 方式 `images` 必须使用本地绝对路径
7. **频率控制**：避免短时间大量发布，防止账号受限

---

## 常见问题 Top3

**Q1: MCP 连不上怎么办？**
→ 检查 18060 端口是否在监听，确认服务地址，重启 MCP 服务。

**Q2: 登录态失效了？**
→ 调用 `check_login_status` 确认状态，调用 `get_login_qrcode` 重新扫码登录后重试。

**Q3: CDP 方式图片传不上去？**
→ 检查文件路径和格式，确认 DOM 选择器是否匹配，可用 `inspect-dom.ts` 排查。

更多问题及详细排查见下方 references。

---

## 典型工作流

### 配合 xhs-images 发布

1. 使用 `xhs-images` 技能生成小红书图文图片
2. 调用本技能，传入生成的图片路径和文案
3. 优先使用 MCP 方式发布
4. 发布成功后返回笔记链接

### 草稿审核后发布

1. 以 CDP 预览模式运行，浏览器打开编辑页
2. 人工审核内容和排版
3. 确认无误后手动点击发布
4. 或使用 `--publish` 参数自动发布

---

## Progressive Disclosure

- **[references/mcp-integration.md](references/mcp-integration.md)** — MCP 集成详情、13 个工具列表、publish_content 完整参数 Schema、故障排查
- **[references/cdp-guide.md](references/cdp-guide.md)** — CDP 架构说明、选择器参考、完整操作步骤、图片/文本填充策略、故障排查
- **[references/posting-guide.md](references/posting-guide.md)** — CDP 发布指南、笔记组成规则、首次登录流程
- **[references/preferences.md](references/preferences.md)** — EXTEND.md 配置、默认标签、Chrome Profile 路径
