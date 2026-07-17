# sc-gemini-web 替代方案：网页 AI 生图能力重构

## ✅ 方案验证结果（2026-07-18 实测通过）

**重要发现**：TRAE 已经内置了 `integrated_browser` MCP 工具，功能完整，**不需要额外安装 `@playwright/mcp`**！

### 实测结果

| 测试项 | Gemini | ChatGPT | 结果 |
|--------|--------|---------|------|
| 页面识别 | ✅ | ✅ | 输入框、按钮等元素 100% 识别 |
| 输入提示词 | ✅ | ✅ | 中文/英文都正常输入 |
| 触发生成 | ✅ | ✅ | 点击发送正常，等待生成正常 |
| 生图成功 | ✅ | ✅ | Nano Banana 小猫 / DALL-E 小狗都成功 |
| 图片识别 | ✅ img 元素 | ✅ img 元素 | snapshot 能准确识别生成的图片 |
| 下载功能 | ✅ 原生下载按钮 | ⚠️ 需右键/JS下载 | Gemini 有直接下载按钮，ChatGPT 需其他方式 |
| 总耗时 | ~15秒 | ~20秒 | 速度可接受 |

### 实测操作流程验证
1. 用户只需要在 TRAE 内置浏览器中打开并登录 Gemini/ChatGPT
2. AI 通过 `browser_tabs` 找到已打开的标签页
3. 通过 `browser_snapshot` 获取页面元素 refs
4. 点击输入框 → 输入提示词 → 点击发送
5. 轮询等待图片生成
6. 识别图片元素并触发下载

---

## 问题背景

### 当前问题
1. **sc-gemini-web 维护成本高**：基于反向工程的 Google Gemini Web API，需要手动维护 SNlM0e token 提取、cookie 管理、请求签名等逻辑，Google 一旦更新前端就会失效
2. **API 访问困难**：国内用户访问 Gemini/ChatGPT 官方 API 成本高、容易被 ban，且支付渠道受限
3. **Web 页面可访问**：Gemini (gemini.google.com) 和 ChatGPT (chatgpt.com) 的网页版相对容易访问，且免费/Plus 用户都有生图能力
4. **重复造轮子**：不应该自己维护浏览器自动化底层，应该依赖专业的 MCP 服务器

### 需求
- 支持通过 Gemini 网页版生成图片（Nano Banana / Imagen）
- 支持通过 ChatGPT 网页版生成图片（DALL-E）
- 方案稳定、维护成本低
- 不依赖官方 API，无需 API Key
- 能够下载生成的图片到本地

---

## 调研结果

### MCP 生态系统现状

| 方案 | 维护方 | 类型 | 优势 | 劣势 |
|------|--------|------|------|------|
| **microsoft/playwright-mcp** | Microsoft 官方 | MCP 服务器 | 官方维护、稳定可靠、功能完整、社区活跃 | 需要 AI 自行操作页面，无现成封装 |
| @anthropic/browser-use | Anthropic | Python 库 | AI 驱动、智能操作 | 非 MCP 标准、需要额外集成 |
| 现有 Gemini/ChatGPT MCP | 社区 | 部分存在 | 封装好 | 大多依赖 API Key、反向工程、维护差 |

### 结论
- **没有现成的、专门针对 Gemini/ChatGPT Web 生图的 MCP 服务器**
- **microsoft/playwright-mcp 是最佳基础**：Microsoft 官方维护，Playwright 是业界标准浏览器自动化工具
- **最佳策略**：不自己开发浏览器自动化底层，而是在专业 MCP 之上封装操作指南和最佳实践

---

## 推荐方案：分层架构

### 架构总览

```
┌─────────────────────────────────────────────────────────────┐
│                    sc-pipeline / sc-writer                  │
│                      （内容创作流水线）                        │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                      sc-image (重构后)                       │
│   统一图片生成入口：根据场景选择合适的生图方式                    │
│   - 网页生图（Gemini/ChatGPT Web）                           │
│   - 官方 API（如果有 key）                                    │
│   - 其他图片 skill                                           │
└────────────────────────────┬────────────────────────────────┘
                             │
         ┌───────────────────┴───────────────────┐
         │                                       │
         ▼                                       ▼
┌──────────────────────┐            ┌──────────────────────────────┐
│  sc-web-ai (新 skill) │            │   其他生图 skill / API        │
│  网页 AI 操作指南     │            │                              │
│  - 提示词模板        │            │  - 官方 API 调用              │
│  - 操作步骤          │            │  - 本地生图模型               │
│  - 故障排查          │            │  - 其他第三方服务             │
└──────────┬───────────┘            └──────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────────────────┐
│              microsoft/playwright-mcp (外部依赖)              │
│                    （专业浏览器自动化 MCP）                    │
└─────────────────────────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────────────────┐
│                    用户本地 Chrome 浏览器                     │
│          （用户已登录 Gemini/ChatGPT 账号）                    │
└─────────────────────────────────────────────────────────────┘
```

---

## 详细方案设计

### 1. 移除 sc-gemini-web

**操作**：
- 删除 `skills/sc-gemini-web/` 整个目录
- 从 `marketplace.json` 中移除
- 更新 CHANGELOG.md

**原因**：
- 反向工程维护成本太高，不如直接用标准浏览器自动化
- 用户自己在浏览器中登录，比我们提取 cookie 更稳定

---

### 2. 新增 sc-web-ai skill：网页 AI 操作指南

**定位**：不是开发新的浏览器自动化工具，而是**提供操作指南和最佳实践**，引导 AI 使用 `playwright-mcp` 来操作网页版 AI。

**目录结构**：
```
skills/sc-web-ai/
├── SKILL.md                    # 主文档：何时使用、能力概述
└── references/
    ├── gemini-image-generation.md   # Gemini 网页生图操作指南
    ├── chatgpt-image-generation.md  # ChatGPT 网页生图操作指南
    ├── browser-automation-tips.md   # 浏览器自动化通用技巧
    └── troubleshooting.md           # 常见问题排查
```

**SKILL.md 核心内容**：
```markdown
---
name: sc-web-ai
description: Use Gemini/ChatGPT web version for image generation via browser automation (Playwright MCP). No API key needed. Use when: generate images with Gemini Nano Banana/Imagen, generate images with ChatGPT DALL-E, use free web AI capabilities, API is not available/too expensive.
---

# sc-web-ai：网页版 AI 能力使用指南

## 适用场景
- 需要使用 Gemini 网页版生图（Nano Banana / Imagen 3）
- 需要使用 ChatGPT 网页版生图（DALL-E 3）
- 没有 API Key 或 API 访问受限
- 需要使用网页版的最新/实验性功能

## 前置依赖
- 必须已安装并启用 `@playwright/mcp` MCP 服务器
- 用户必须已在本地 Chrome 浏览器中登录了 gemini.google.com 或 chatgpt.com

## 核心原则
1. **不要自己写反向工程代码** — 全程使用 playwright-mcp 提供的工具操作页面
2. **让用户自己登录** — 不要尝试提取 cookie 或自动登录，让用户保持浏览器登录状态
3. **耐心等待** — AI 生图需要时间，每步操作后等待页面加载完成
4. **下载图片** — 生成后通过浏览器下载功能或右键保存到本地
```

**references/gemini-image-generation.md 示例内容**：
```markdown
# Gemini 网页版生图操作指南

## 前置检查
1. 调用 browser_navigate 打开 https://gemini.google.com/
2. 调用 browser_snapshot 检查页面状态：
   - 如果显示"登录"按钮，提示用户先在浏览器中登录
   - 如果显示聊天输入框，说明就绪

## 生图步骤

### 步骤 1：输入提示词
1. 使用 browser_snapshot 找到输入框的 ref
2. 使用 browser_type 在输入框中输入提示词
   - 提示词建议用英文，效果更好
   - 明确说明"generate an image"或使用中文"生成一张图片"
3. 使用 browser_press_key 按 Enter 发送

### 步骤 2：等待生成
- Gemini 生图通常需要 10-30 秒
- 每 3-5 秒调用一次 browser_snapshot 检查状态
- 等待图片出现在页面上
- 注意：不要频繁刷新，可能会触发限流

### 步骤 3：下载图片
1. 图片生成后，使用 browser_snapshot 找到图片元素
2. 使用 browser_click 点击图片查看大图
3. 右键点击图片（browser_evaluate 模拟右键）
4. 选择"Save image as..."保存到用户指定的路径
5. 或者直接获取图片的 src URL，提示用户手动下载

## 提示词模板
### Nano Banana 风格（Gemini 特色）
```
Generate an image in Nano Banana style: [描述]. 
The image should have a cute, hand-drawn, 2D illustration style with soft colors, 
simple shapes, and a warm, friendly feeling. White background.
```

### 写实风格
```
Generate a photorealistic image: [描述]. 
High resolution, detailed, professional photography, 8k, natural lighting.
```

## 常见问题
- **一直转圈不生成**：刷新页面重试，可能触发了限流
- **提示"无法生成图片"**：换个提示词，可能包含敏感词
- **图片加载失败**：右键点击图片选择"重新加载图片"
```

---

### 3. 重构 sc-image：统一图片入口

**现状**：sc-image 目前主要依赖外部的 imagine skill 调用 API。

**重构方向**：
- 增加图片生成策略选择逻辑
- 优先级：
  1. 如果有 API Key，优先使用官方 API（速度快、稳定）
  2. 如果没有 API Key，使用 sc-web-ai 通过网页版生成
  3. 其他备用方案

**修改内容**：
- 更新 `skills/sc-image/SKILL.md`，增加策略选择说明
- 增加 `references/image-generation-strategy.md` 文档
- 不改动现有 API 调用逻辑，只是增加网页版作为 fallback

---

### 4. 配置指南：如何启用 playwright-mcp

在文档中告诉用户如何配置 MCP：

**文档位置**：`skills/sc-web-ai/references/setup-guide.md`

**内容示例**：
```markdown
# Playwright MCP 配置指南

## 在 TRAE/Cursor 等 AI IDE 中配置

### 方式 1：自动安装（推荐）
在 AI IDE 的 MCP 设置中搜索 `@playwright/mcp`，点击安装即可。

### 方式 2：手动配置
在 MCP 配置文件中添加：

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest"]
    }
  }
}
```

### 配置连接到用户本地 Chrome（推荐）
为了复用用户已登录的状态（Gemini/ChatGPT 登录态），配置为连接用户本地 Chrome：

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": [
        "@playwright/mcp@latest",
        "--browser", "chrome",
        "--channel", "chrome",
        "--user-data-dir", "/Users/[用户名]/Library/Application Support/Google/Chrome"
      ]
    }
  }
}
```

注意：
- Windows 用户路径：`C:\\Users\\[用户名]\\AppData\\Local\\Google\\Chrome\\User Data`
- macOS 用户路径如上
- Linux 用户路径：`~/.config/google-chrome`
- 使用用户数据目录时，需要先关闭所有 Chrome 窗口，否则会启动失败
- 或者使用 `--launch-options` 启动一个新的 Chrome 实例，但需要重新登录
```

---

## 方案优势

### 1. 维护成本极低
- 底层浏览器自动化由 Microsoft 官方的 playwright-mcp 维护，我们不需要管
- Google/ChatGPT 前端更新时，只要页面结构变化不大，AI 通过视觉/snapshot 仍然能操作
- 即使页面变了，只需要更新提示词/操作指南，不需要改代码

### 2. 稳定性更好
- 使用用户自己的浏览器和登录态，不容易被识别为机器人
- 不需要维护 cookie 提取、token 解析等反向工程逻辑
- Playwright 是业界标准，比我们自己写的 CDP 代码更可靠

### 3. 灵活性更高
- 不仅支持生图，未来还可以扩展到网页版的其他能力
- 支持 Gemini Advanced、ChatGPT Plus 等付费用户的高级功能
- 可以很容易地扩展支持其他 AI 网页（Claude、Midjourney Web 等）

### 4. 真正符合"不重复造轮子"原则
- 依赖专业团队维护的开源项目
- 我们只做轻量级的 skill 封装（提示词 + 操作指南）
- 把精力放在内容创作的核心流程上

---

## 实施步骤

| 步骤 | 内容 | 预计工作量 |
|------|------|-----------|
| 1 | 删除 sc-gemini-web 目录，更新 marketplace.json 和 CHANGELOG | 小 |
| 2 | 创建 sc-web-ai skill 及所有参考文档 | 中 |
| 3 | 更新 sc-image skill，增加策略选择逻辑 | 小 |
| 4 | 更新 sc-pipeline 中对图片生成的引用，改为调用 sc-image | 小 |
| 5 | 在 README 中增加配置说明，告诉用户如何启用 playwright-mcp | 小 |

---

## 备选方案对比

| 方案 | 维护成本 | 稳定性 | 灵活性 | 推荐度 |
|------|---------|--------|--------|--------|
| **A：推荐方案（sc-web-ai + playwright-mcp）** | 极低 | 高 | 高 | ⭐⭐⭐⭐⭐ |
| B：继续维护 sc-gemini-web | 极高 | 低 | 低 | ⭐ |
| C：自己写一个 playwright-mcp 的封装 MCP | 中 | 中 | 中 | ⭐⭐ |
| D：只保留 API 调用，不支持网页版 | 低 | 高 | 低 | ⭐⭐⭐ |

---

## 总结

**推荐采用方案 A**：
1. ✅ 删除 sc-gemini-web
2. ✅ 新增轻量级的 sc-web-ai skill（只有文档和提示词，没有代码）
3. ✅ 依赖微软官方的 `@playwright/mcp` 做浏览器自动化
4. ✅ 重构 sc-image 统一图片入口，支持 API/网页多种方式
5. ✅ 提供清晰的配置文档

这是一个"少即是多"的方案：我们写的代码越少，维护成本越低，稳定性越高。把专业的事情交给专业的团队（Microsoft Playwright 团队），我们只专注于内容创作流程本身。
