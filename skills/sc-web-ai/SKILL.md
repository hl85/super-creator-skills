---
name: sc-web-ai
description: Use Gemini/ChatGPT web version for image generation and other tasks via browser automation. No API key needed. Use when: generate images with Gemini Nano Banana/Imagen, generate images with ChatGPT DALL-E, use free web AI capabilities, API is not available/too expensive.
---

# sc-web-ai：网页版 AI 能力使用指南

通过浏览器自动化操作网页版 Gemini 和 ChatGPT，无需 API Key 即可使用生图等能力。

## 适用场景

- 需要使用 Gemini 网页版生图（Nano Banana / Imagen 3）
- 需要使用 ChatGPT 网页版生图（DALL-E 3）
- 没有 API Key 或 API 访问受限/费用过高
- 需要使用网页版的最新/实验性功能
- 需要利用用户已有的 Plus/Advanced 订阅权益

## 前置检查（重要）

**在开始操作前，必须先检查可用的浏览器 MCP 工具：**

1. **优先使用 IDE 内置浏览器工具**：
   - 检查是否存在 `integrated_browser` MCP 服务器
   - 检查是否有以下工具可用：`browser_tabs`、`browser_navigate`、`browser_snapshot`、`browser_click`、`browser_type`
   - **TRAE 等主流 AI IDE 已内置此工具，无需额外安装**

2. **如果内置工具不存在，再考虑安装外部 MCP**：
   - 备选方案 1：`@playwright/mcp`（Microsoft 官方维护）
   - 备选方案 2：`@anthropic/browser-use`（如可用）
   - 参考 `references/mcp-setup.md` 查看安装配置指南

## 使用前准备

用户需要提前在浏览器中：
1. 打开 https://gemini.google.com/ 并登录（如需 Gemini）
2. 打开 https://chatgpt.com/ 并登录（如需 ChatGPT）
3. 保持标签页打开状态

> 如果用户没有打开，使用 `browser_navigate` 打开对应网址，并提示用户手动完成登录。

## 核心原则

1. **优先使用 IDE 内置工具**：不要重复造轮子，不要自己写反向工程代码
2. **让用户自己登录**：不要尝试自动登录或提取 Cookie，用户在浏览器中登录最稳定
3. **全程使用 snapshot 驱动**：每一步操作前先 `browser_snapshot` 获取元素 ref，不要硬编码选择器
4. **耐心等待**：AI 生图需要 10-30 秒，每步操作后使用 `browser_wait_for` 或轮询 snapshot 检查状态
5. **优先复用现有标签页**：使用 `browser_tabs` 查找已打开的 Gemini/ChatGPT 标签，而不是新开标签

## 标准操作流程

### 通用流程（适用于 Gemini 和 ChatGPT）

```
1. 调用 browser_tabs(action: "list") 查看所有标签页
2. 找到目标标签页（Gemini/ChatGPT），记录 viewId
3. 如果没有目标标签页：
   - 调用 browser_navigate(url: 对应网址, newTab: true)
   - 提示用户完成登录
   - 等待登录完成（轮询 snapshot 检查是否出现输入框）
4. 调用 browser_snapshot 获取页面元素，找到输入框 ref
5. 点击输入框：browser_click(ref: 输入框ref)
6. 输入提示词：browser_type(ref: 输入框ref, text: 提示词)
7. 找到发送按钮并点击
8. 轮询等待（每 3-5 秒 snapshot 一次）：
   - 等待"停止生成"按钮消失
   - 等待图片元素（img 角色）出现在 snapshot 中
9. 图片生成后：
   - 优先点击页面上的原生下载按钮
   - 如果没有下载按钮，参考对应平台的下载指南
10. 确认图片已保存到本地
```

### 平台特定指南

- **Gemini 生图**：参考 `references/gemini-image-generation.md`
- **ChatGPT 生图**：参考 `references/chatgpt-image-generation.md`
- **浏览器自动化技巧**：参考 `references/browser-tips.md`
- **常见问题排查**：参考 `references/troubleshooting.md`
- **视觉风格库**：参考 [sc-styles](../sc-styles/references/catalog.md) 获取 49+ 种预设风格提示词

## 提示词建议

- 从 [sc-styles 风格库](../sc-styles/references/catalog.md) 选择风格，使用风格文件中的 Example Prompt
- Gemini Nano Banana 风格建议使用英文提示词，效果更好
- ChatGPT DALL-E 中英文都可以
- 明确说明图片风格、尺寸、背景等要求
- 如果一次生成不满意，可以点击"重做"或调整提示词重新生成
