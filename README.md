# super-creator

AI 驱动的内容创作工具箱，专为小红书和微信公众号打造。

> **零配置免费生图**：不需要 API Key，直接用 Gemini/ChatGPT 网页版生图。

---

## 能帮你做什么？

从选题到发布，一站式搞定内容创作：

| 阶段 | 能力 | 核心 Skill |
|------|------|-----------|
| 🔍 选题 | 竞品内容分析、热点挖掘 | `sc-content-mining` |
| ✍️ 写作 | 爆款文案生成、风格调整 | `sc-writer` |
| 🎨 配图 | 封面图、文章插画、小红书信息图（免费生图） | `sc-web-ai`、`sc-cover-image`、`sc-article-illustrator`、`sc-xhs-images` |
| ✅ 审核 | 合规检查、事实核查、图片压缩 | `sc-content-review`、`sc-compress-image`、`sc-format-markdown` |
| 🚀 发布 | 一键发布到公众号/小红书 | `sc-publish-wechat`、`sc-publish-xhs` |
| 🎬 全流程 | 全自动流水线编排 | `sc-pipeline` |

---

## 5 分钟快速开始

### 1. 安装

super-creator-skills 的核心是 Markdown 文件 + TypeScript 脚本，**不绑定任何特定 IDE**。任何支持读取文件和 MCP 的 AI IDE 都能使用。

**TRAE（推荐，已验证）**：
将仓库 clone 到工作目录，TRAE 启动时会自动扫描 `.agents/skills/` 目录加载所有 skill。

**Claude Code**：
```bash
/plugin marketplace add hl85/super-creator
```

**Cursor / 其他 AI IDE**：
将仓库 clone 到项目目录，在 IDE 中打开该目录，AI 助手会自动识别 `skills/` 目录下的 SKILL.md 文件。

> `.claude-plugin/` 目录是 Claude Code 的插件注册兼容层，不影响其他 IDE 使用。详见 [IDE 兼容性说明](docs/ide-compatibility.md)。

### 2. 配置免费生图（重要！不需要 API Key）

这是 v3.4.0 之后最推荐的方式：

1. 在 IDE 内置浏览器中打开 https://gemini.google.com/
2. 登录你的 Google 账号
3. 保持标签页打开即可

✅ 完成！不需要配置任何 API Key，就可以免费生成 Nano Banana 风格的高质量图片。

（备选）也可以登录 https://chatgpt.com/ 使用 DALL-E 生图。

### 3. 开始创作

直接用自然语言告诉 AI 你要做什么：

```
帮我写一篇关于"AI 编程工具对比"的公众号文章，配好封面和插图，走完全流程
```

或者：

```
帮我做一组小红书图片，主题是"应届生面试技巧"，用可爱风格
```

---

## 图片生成（最重要的能力）

**我们做了一个重大决定：优先用网页版免费生图，不需要花钱买 API。**

| 方式 | 需要 | 费用 | 推荐度 | 说明 |
|------|------|------|--------|------|
| **网页 AI（首选）** | IDE 浏览器登录 Gemini | 免费 | ⭐⭐⭐⭐⭐ | Nano Banana 风格效果绝佳 |
| 官方 API | API Key | 付费 | ⭐⭐⭐ | 批量生成时使用 |
| ~~混元 DashScope~~ | API Key | 付费 | ❌ | 效果不佳，已从默认选项移除 |

详细策略：[图片生成引擎优先级](docs/image-generation-priority.md)

---

## 核心 Skill 一览

### 创作流水线

| Skill | 用途 |
|-------|------|
| `sc-pipeline` | **一键全流程**：自动完成选题→写作→配图→审核→发布 |
| `sc-writer` | 文案写作：小红书/公众号不同风格适配 |
| `sc-content-mining` | 内容挖掘：竞品分析、素材收集 |

### 视觉创作

| Skill | 用途 |
|-------|------|
| `sc-styles` | **统一风格库**：49 种视觉风格定义，所有配图 skill 共享 |
| `sc-web-ai` | **免费生图**：通过浏览器操作 Gemini/ChatGPT 生图，零成本 |
| `sc-cover-image` | 公众号封面图：2.35:1 比例，多种风格模板 |
| `sc-article-illustrator` | 文章插画：22 种内置风格，支持批量生成 |
| `sc-xhs-images` | 小红书信息图：11 种风格，8 种布局，爆款模板 |
| `sc-imagine` | API 生图：支持多服务商批量生图（备选） |

### 审核与优化

| Skill | 用途 |
|-------|------|
| `sc-content-review` | 内容审核：合规检查、敏感词、事实核查 |
| `sc-compress-image` | 图片压缩：自动转 WebP，保证加载速度 |
| `sc-format-markdown` | Markdown 格式化：标题、列表、引用统一规范 |
| `sc-convert-markdown-to-html` | Markdown 转公众号排版：5 套主题，代码高亮 |

### 发布

| Skill | 用途 |
|-------|------|
| `sc-publish-wechat` | 发布到微信公众号：自动粘贴排版、上传图片 |
| `sc-publish-xhs` | 发布到小红书：创作者中心自动上传 |

---

## 生图效果展示

### Nano Banana 风格（Gemini 免费生图）
- 可爱手绘 2D 插画
- 柔和色彩，简约造型
- 非常适合公众号/小红书配图
- 免费无限量（有合理的速率限制）

### 49 种视觉风格（统一风格库）

所有配图 skill 共享一套统一的视觉风格库，包含 5 大分类：

| 分类 | 数量 | 代表风格 |
|------|------|---------|
| 技法/媒介 | 12 | 水彩、像素、粉笔、丝网印刷、素描、黏土、折纸 |
| 情绪/氛围 | 13 | 温暖、优雅、极简、活泼、复古、可爱、暗黑 |
| 设计范式 | 11 | Notion、蓝图、编辑出版、科学、自然、吉卜力、企业孟菲斯 |
| 特殊/创意 | 10 | 赛博朋克、乐高、宜家说明书、平铺陈列、地铁图、线框图 |
| 漫画专用 | 5 | 日漫、清线、水墨、写实、粉笔 |

浏览完整风格目录和示例提示词：[sc-styles/references/catalog.md](skills/sc-styles/references/catalog.md)

---

## 进阶配置（可选）

虽然网页生图免费够用，但如果你需要批量生成或更稳定的服务，可以配置 API Key：

### 配置 API Key（可选）

编辑 `~/.super-creator/.env` 文件：

```bash
# 选择你有的 Key 配置即可，不需要全部
GOOGLE_API_KEY=你的_Gemini_API_Key
OPENAI_API_KEY=你的_OpenAI_API_Key
# ... 其他服务商
```

所有环境变量说明：[环境变量参考](docs/env-reference.md)

### 手动运行命令

所有 Skill 都可以通过 `sc-run` 手动调用：

```bash
# 通用格式
./sc-run <skill-name> <script-name> [参数...]

# 示例：API 生图
./sc-run sc-imagine main --prompt "可爱的小猫咪" --image cat.png

# 示例：Markdown 转公众号排版
./sc-run sc-convert-markdown-to-html main article.md
```

---

## 常见问题

### Q: 为什么我看不到生成的图片？
A: 检查 IDE 内置浏览器中 Gemini 是否登录成功。如果登录了，AI 会自动操作浏览器生图并下载到你的下载目录。

### Q: 网页生图会被 ban 吗？
A: 不会。这就像你自己手动在浏览器中生图一样，使用你自己的账号，正常使用不会有问题。

### Q: 需要翻墙吗？
A: 和你平时访问 Gemini/ChatGPT 一样。如果你能在浏览器中正常打开 gemini.google.com，就能用。

### Q: 为什么移除混元作为默认 fallback？
A: 经过实际测试，混元的生图质量明显不如 Gemini Nano Banana 和 DALL-E，所以不再默认使用。如果你确实需要，仍然可以通过 `--provider dashscope` 手动指定。

### Q: 支持哪些平台？
A: 目前专注于 **小红书** 和 **微信公众号** 两个平台。

---

## 文档索引

| 文档 | 说明 |
|------|------|
| [架构设计](#架构设计) | 三层 Skill 架构和核心设计原则 |
| [统一风格库](skills/sc-styles/references/catalog.md) | 49 种视觉风格总目录和提示词 |
| [IDE 兼容性说明](docs/ide-compatibility.md) | 各 AI IDE 支持情况和配置方法 |
| [图片生成优先级](docs/image-generation-priority.md) | 免费网页生图 / API 生图的选择策略 |
| [快速上手](docs/quickstart.md) | 更详细的安装和配置教程 |
| [流水线说明](docs/pipeline.md) | 全流程 6 个阶段的工作原理 |
| [环境变量参考](docs/env-reference.md) | 所有 API Key 和配置项说明 |
| [视觉 Skill 选择指南](docs/visuals.md) | 不同场景用什么配图 Skill |
| [创建新 Skill](docs/creating-skills.md) | 如何为 super-creator 贡献新 Skill |
| [更新日志](CHANGELOG.md) | 每个版本的变更记录 |

---

## 架构设计

本项目遵循 AI Skill 设计最佳实践，采用分层架构，每个 Skill 有明确的职责边界。

### 三层 Skill 架构

| 层级 | 模式 | 职责 | 代表 Skill |
|------|------|------|-----------|
| **共享资产层** | Tool Wrapper | 提供知识规范和共享资源，不直接生成内容 | `sc-styles` |
| **能力引擎层** | Generator | 封装具体能力（生图、转码、压缩），输出稳定结果 | `sc-web-ai`、`sc-imagine`、`sc-compress-image`、`sc-convert-markdown-to-html` |
| **工作流层** | Pipeline | 编排多步骤流程，带硬门槛防止跳步 | `sc-pipeline`、`sc-cover-image`、`sc-article-illustrator`、`sc-xhs-images`、`sc-publish-*` |

### 核心设计原则

1. **单一数据源**：风格定义集中在 `sc-styles`，所有上层 Skill 引用同一套定义，避免重复维护导致不一致
2. **渐进式加载**：每个 SKILL.md 只做"索引 + 执行协议"，具体规范和模板放在 `references/` 按需加载，不浪费上下文
3. **零破坏性扩展**：新增风格只需在 `sc-styles/references/styles/` 加一个 .md 文件，所有生图 Skill 自动可用
4. **硬门槛机制**：Pipeline 类型 Skill 在关键节点设置检查点（如内容审核、图片压缩），不通过不进入下一步

### 文件组织约定

```
skills/sc-{name}/
├── SKILL.md              # 入口：索引 + 执行协议（必需，保持精简）
├── references/           # 参考资料：规范、检查清单、风格指南（按需加载）
│   └── styles/           # 风格定义（仅 sc-styles 有）
├── assets/               # 静态资源：模板、示例
└── scripts/              # 可执行脚本（确定性操作）
```

---

## 设计理念

1. **用户视角优先**：先能用、好用，再谈技术实现
2. **零配置起步**：免费生图开箱即用，不需要一开始就让用户配一堆 Key
3. **不重复造轮子**：浏览器自动化交给 IDE 内置的 MCP，我们只写使用指南
4. **维护成本最小化**：去掉所有需要高频维护的反向工程代码
5. **中文用户优先**：所有文档都是中文，不考虑英文用户
6. **共享资产优先**：能复用的定义（如风格、模板）集中管理，不分散到各个 Skill
7. **渐进式披露**：SKILL.md 保持精简，细节放在 references/ 按需加载，不浪费 AI 上下文

---

## 免责声明

- 本工具箱仅用于辅助内容创作，你需要对自己发布的内容负责
- 使用 Gemini/ChatGPT 网页版时请遵守 Google 和 OpenAI 的服务条款
- 发布到公众号/小红书时请遵守对应平台的规则
