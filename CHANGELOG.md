# 更新日志

## 3.5.0 - 2026-07-18

### 新增
- **新 skill `sc-styles`**（Tool Wrapper 模式）：统一图像风格库，为所有生图/配图 skill 提供标准化的视觉风格定义
  - 收录 **49 种视觉风格**，覆盖技法/媒介、情绪/氛围、设计范式、特殊/创意、漫画专用五大分类
  - 从 git 历史恢复了 v3.2.0 重构中删除的 infographic（20种）、comic（5种艺术风格）、slide-deck（4种独有风格）的风格定义
  - 统一了所有风格文件格式：Atmosphere → Color Palette → Visual Elements → Style Rules → Example Prompt → Best For
  - 提供 `references/catalog.md` 风格总目录，含分类索引和场景推荐表
  - 遵循 Skill 设计最佳实践：SKILL.md 作为"索引+执行协议"，具体风格定义按需从 references/styles/ 加载

### 变更
- **所有视觉类 skill 添加 sc-styles 引用**：sc-article-illustrator、sc-cover-image、sc-xhs-images、sc-imagine、sc-web-ai 均在文档中指向统一风格库
- **marketplace.json 注册 sc-styles**，总 skill 数从 14 增至 15
- **sc-web-ai 生图指南更新**：补充 ChatGPT contenteditable 输入框的正确操作方式（execCommand）、分享浮层下载路径、快速参考 JS 片段，大幅降低浏览器自动化摩擦

### 架构改进
- 采用 Tool Wrapper 设计模式：风格定义作为共享资产集中管理，上层 skill（Generator/Pipeline）按需引用
- 消除风格定义的重复维护：未来新增/修改风格只需更新 sc-styles 一处
- 渐进式加载：Agent 先看到 SKILL.md 索引，需要时再加载具体风格文件，不浪费上下文

### IDE 兼容性改进
- **文档去品牌化**：将文档中 AI 助手代称从"Claude"统一改为"AI 助手"，消除对特定 IDE 的品牌依赖
- **多 IDE 安装说明**：README 提供 TRAE / Claude Code / Cursor 三种安装方式
- **`.claude-plugin/` 明确定位为兼容层**：不再作为唯一安装方式，TRAE 通过 `.agents/skills/` 自动扫描加载
- **新增 `docs/ide-compatibility.md`**：详细说明各 IDE 的支持情况、Skill 加载方式、MCP 配置方法
- **SKILL.md 命名规范扩展**：skill name 字段禁止包含 "trae"/"cursor" 等 IDE 名，文档要求 IDE 中立
- **`CLAUDE.md` 更新**：标题改为"AI 开发指南"，明确说明文件名遵循 Claude Code 约定但内容面向所有 AI IDE

## 3.4.0 - 2026-07-18

### 破坏性变更
- **移除 `sc-gemini-web`**：基于反向工程的 Gemini Web API skill 因维护成本过高被移除，替换为更可靠的浏览器自动化方案。
- **生图引擎优先级调整**：网页 AI（`sc-web-ai`）现在是所有图片生成的**默认首选**。API 方式（`sc-imagine`）降为次选。
- **混元 DashScope 从自动 fallback 中移除**：由于生图效果不佳，DashScope 不再作为自动 fallback 选项。用户仍可通过 `--provider dashscope` 主动指定使用。

### 新增
- **新 skill `sc-web-ai`**：通过浏览器自动化使用 Gemini/ChatGPT 网页版生图，无需 API Key
  - 零代码、零维护 — 依赖 IDE 内置浏览器 MCP（如 TRAE 的 `integrated_browser`）或 `@playwright/mcp`
  - 同时支持 Gemini（Nano Banana / Imagen）和 ChatGPT（DALL-E）网页生图
  - 优先级探测：优先使用 IDE 内置浏览器工具，不存在时再安装 @playwright/mcp 作为备选
  - 包含完整的双平台操作指南、浏览器自动化技巧、MCP 配置指南和故障排查文档
  - 经过真实场景测试验证：Gemini 和 ChatGPT 生图成功率 100%
- **统一图片生成优先级策略**：新增 `docs/image-generation-priority.md`，为所有视觉类 skill 定义标准的引擎选择策略
- **更新所有图片生成约定**：`sc-xhs-images`、`sc-cover-image`、`sc-article-illustrator` 均遵循新的优先级顺序

### 变更
- **图片生成策略**：网页 AI（免费、浏览器方式）现在是所有视觉 skill 的首选；API 方式仅用于批量生成、参考图、或网页方式不可用时
- **sc-imagine provider 自动选择顺序调整**：新顺序为 Google → OpenAI → Azure → OpenRouter → Replicate → Seedream → MiniMax → Jimeng（DashScope 已从自动检测中移除）
- **sc-imagine 版本升级至 1.57.0**：更新描述说明其次要定位；大多数场景优先使用 sc-web-ai
- **零额外依赖**：在 TRAE 等内置浏览器 MCP 的 IDE 中开箱即用
- **维护成本大幅降低**：不再需要维护 Cookie 提取、SNlM0e token 解析、签名逻辑等反向工程代码

## 3.3.0 - 2026-07-17

### 破坏性变更
- **sc-writeflow → sc-writer**：重命名以更简洁。移除 X/Twitter 平台支持，仅保留 xhs 和 wechat。
- **sc-xhs-pipeline → sc-pipeline**：从小红书专属升级为双平台通用编排器，同时支持小红书和微信公众号。
- **统一命名规范**：
  - `sc-post-to-wechat` → `sc-publish-wechat`（publish-{平台} 模式）
  - `sc-post-to-xhs` → `sc-publish-xhs`（publish-{平台} 模式）
  - `sc-markdown-to-html` → `sc-convert-markdown-to-html`（convert-{from}-to-{to} 模式）
- **发布前硬闸门**：两个平台的流水线在发布前都强制执行 review 阶段：
  - `sc-content-review`（合规+事实核查+链接健康）— critical 级别问题阻塞发布
  - `sc-compress-image`（WebP 压缩）— 图片必须压缩后才能发布
  - `sc-format-markdown`（仅公众号）— 发布前必须排版格式化
- **公众号流水线**（5 阶段）：mining → writing → visuals（封面+配图）→ review（排版+审核+压缩）→ publishing
- **小红书流水线**（5 阶段）：mining → writing → imaging → review（审核+压缩）→ publishing
- 状态文件 schema 升级至 v4.0.0：新增 platform 字段、平台差异化阶段数组、review 阶段产物
- 新增文件：`references/hard-gates.md`、`references/platforms/xhs.md`、`references/platforms/wechat.md`
- 移除 sc-content-review 中的 X/Twitter 红线规则文件（x-redlines.md）
- CLI 参数：`--platform` / `-p` 接受 `xhs`（默认）或 `wechat`

## 3.2.0 - 2026-07-17

### 破坏性变更
- **聚焦两大核心平台：小红书 + 微信公众号**。移除 7 个平台专属和低使用频率的 skill：
  - `sc-post-to-x` — X/Twitter 发布（非目标平台）
  - `sc-post-to-weibo` — 微博发布（非目标平台）
  - `sc-markdown-to-thread` — X 推文串转换（仅服务于 sc-post-to-x）
  - `sc-multi-publish` — 多平台一键分发（仅 2 个平台，各有独立流水线）
  - `sc-slide-deck` — 幻灯片/PPT 生成（与小红书+公众号内容形态不匹配）
  - `sc-comic` — 知识漫画生成（非核心内容形式）
  - `sc-infographic` — 单张信息图生成（已由 sc-xhs-images 和 sc-article-illustrator 覆盖）

### 精简后
- **剩余 14 个 skill**，全部直接服务于小红书 + 公众号内容生产链路
- 小红书链路：sc-content-mining → sc-writeflow → sc-xhs-images → sc-post-to-xhs（或 sc-xhs-pipeline 一键走完）
- 公众号链路：sc-content-mining → sc-writeflow → sc-markdown-to-html → sc-post-to-wechat（配 sc-cover-image + sc-article-illustrator 做视觉）

## 3.1.0 - 2026-07-17

### 破坏性变更
- **移除 6 个非核心 skill**：`idea-radar`、`post-analytics`、`translate`、`x-to-markdown`、`yt-transcript`、`url-to-markdown` — 与核心内容创作发布无直接关联
- **全部 21 个剩余 skill 统一使用 `sc-` 前缀**，与 super-creator 品牌命名空间保持一致：
  - `article-illustrator` → `sc-article-illustrator`
  - `comic` → `sc-comic`
  - `compress-image` → `sc-compress-image`
  - `content-mining` → `sc-content-mining`
  - `content-review` → `sc-content-review`
  - `cover-image` → `sc-cover-image`
  - `format-markdown` → `sc-format-markdown`
  - `gemini-web` → `sc-gemini-web`
  - `imagine` → `sc-imagine`
  - `infographic` → `sc-infographic`
  - `markdown-to-html` → `sc-markdown-to-html`
  - `markdown-to-thread` → `sc-markdown-to-thread`
  - `multi-publish` → `sc-multi-publish`
  - `post-to-wechat` → `sc-post-to-wechat`
  - `post-to-weibo` → `sc-post-to-weibo`
  - `post-to-x` → `sc-post-to-x`
  - `post-to-xhs` → `sc-post-to-xhs`
  - `slide-deck` → `sc-slide-deck`
  - `writeflow` → `sc-writeflow`
  - `xhs-images` → `sc-xhs-images`
  - `xhs-pipeline` → `sc-xhs-pipeline`

### 流水线变更
- 内容流水线从 8 阶段精简为 6 阶段（移除 idea-radar 发现和 post-analytics 数据回收）
- 从 pipeline 文档中移除"X URL 转换 Skill 选择指南"章节

### 说明
- 用户配置目录 `.super-creator/<skill-name>/` 保持不变（使用短名称，用户更友好）
- `screenshots/` 目录名保持不变（资源目录，非 skill 目录）
- 所有文档和引用已同步更新

## 3.0.1 - 2026-05-13

### 变更
- 重命名 skill 目录 `xiaohongshu-images` → `xhs-images`，与项目整体命名风格保持一致
- 重命名 skill 目录 `youtube-transcript` → `yt-transcript`，统一使用缩写命名
- 同步更新所有交叉引用（docs、scripts、marketplace.json，共 33 个文件）

### 运维
- 新增 `docs/release.md` — 标准化发布流程文档
- 新增 `docs/operations/version-management.md` — 版本策略及一致性检查说明
- 新增 `.githooks/pre-commit` — 每次 commit 前自动执行版本一致性检查

## 3.0.0 - 2026-05-12

### 重大架构重构
- **意图导向路由器 (Intent-based Router)**：重构全部 24 个 skill，遵循“意图优先”设计。
- **语义化命令行 (`sc-run`)**：在项目根目录引入统一入口。Agent 现在通过 `./sc-run <skill> <script>` 调用，无需手动解析路径。
- **渐进式披露 (Progressive Disclosure)**：
  - 将所有 `SKILL.md` 瘦身至 30 行以内（仅保留核心意图和常用命令）。
  - 将超过 10,000 行的技术细节、参数表和工作流迁移至各 skill 目录下的 `references/` 文件夹。
- **自愈环境 (Self-healing Environment)**：
  - 在自动化脚本中集成了 CDP 端口冲突自动清理（自动杀掉残留 Chrome 进程）。
  - 统一支持 `--check` 参数，实现一键环境自检。

## 2.1.0 - 2026-04-29

### 变更
- 品牌重塑完成：统一使用 `super-creator` 品牌
- 所有 skill 添加 `sc-` 前缀
- 重命名 workspace 包为 `sc-md`、`sc-fetch`、`sc-chrome-cdp`
- 运行时配置目录统一为 `.super-creator/`
- 环境变量前缀统一为 `SC_*`

### 维护
- 升级了 6 个技能（slide-deck, infographic, article-illustrator, cover-image, xhs-images, comic）中的 101 个设计参考文件
- 为设计风格增加了 `## 氛围`（Atmosphere）叙述和 `### 避免`（Avoid）反模式
- 增加了 `## 示例提示词`（Example Prompt）以便直接生成图像
