# 仓库指南

本文件为 AI 编码工具（如 Codex、Trae、Cursor）提供操作指引。

## 项目定位

这**不是软件产品仓库**，是王喂马老师的课程工作仓库，面向工作 5 年以内的软件学生和工程师做求职赋能（面试辅导 + 技能课程）。仓库包含：

- **课程内容**（Markdown）在 `courses/` 下
- **商业/规划文档**在 `docs/`
- **店铺文案**在 `shops/`（淘宝、闲鱼、小红书）
- **super-creator-skills**：本目录下的 AI 内容创作工具箱 Skill 集合

本仓库大部分工作是编辑中文 Markdown。除非用户另有要求，否则保持现有语气、结构和标题。

## 语言原则

**所有文档使用中文**。不考虑向英文用户群渗透，不需要维护英文文档。

## super-creator-skills 结构

```
skills/          # 14 个 Skill（每个包含 SKILL.md、scripts/、references/）
packages/        # 共享 TypeScript 库（sc-chrome-cdp、sc-md）
docs/            # 指南：Chrome 配置、发布、图片生成策略、IDE 兼容性等
.githooks/       # Git hooks（npm install 时自动安装）
.claude-plugin/  # Claude Code 插件注册表兼容层（marketplace.json）
.super/          # 过程产物（gitignored，项目临时目录）
posts/           # 最终交付物（用户可见）
```

每个 Skill 遵循标准布局：`SKILL.md`（YAML frontmatter + 30 行以内说明），可选 `scripts/`、`references/`、`prompts/`。共享代码在 `packages/`，发布时同步到各个 Skill。

### IDE 无关性

super-creator-skills 的核心资产（SKILL.md Markdown 文档 + TypeScript scripts/）是**完全 IDE 中立**的，不依赖任何特定 AI IDE。

- `.claude-plugin/` 目录仅为 Claude Code 的插件注册兼容层，不影响其他 IDE 使用
- Skills 通过 `.agents/skills/` 目录自动扫描（TRAE）或 `skills/` 目录手动引用（Cursor/Codex 等）
- MCP 工具（如 `integrated_browser`）使用标准 MCP 协议，主流 AI IDE 均支持
- 详见 `docs/ide-compatibility.md`

## 当前版本：v3.5.0

核心变更：
- 新增 `sc-styles`（Tool Wrapper 模式）：统一图像风格库，收录 49 种视觉风格
- 从 git 历史恢复 infographic/comic/slide-deck 的风格定义
- 所有视觉类 skill 统一引用 sc-styles，消除风格定义的重复维护
- 文档中 AI 助手代称去品牌化（"Claude" → "AI 助手"）
- IDE 兼容性改进：.claude-plugin 明确为兼容层，README 提供多 IDE 安装说明

## 构建、测试和开发

```bash
npm test                  # 通过 node:test 运行所有测试
npm run test:coverage     # 带覆盖率报告的测试
```

TypeScript 通过 Bun 运行（无需构建步骤）。运行时检测：优先 `bun`，备选 `npx -y bun`。

```bash
bun skills/<skill>/scripts/main.ts [args]
```

## 编码风格

- 使用 `type: "module"` (ESM) 的 TypeScript
- 除非逻辑确实不直观，否则不写代码注释
- 使用 async/await 而不是原始 Promise。变量名简短但描述性强
- 所有结构化数据使用类型安全接口
- 2 空格缩进，遵循现有文件约定

## 测试要求

### 测试框架
- 框架：`node:test`（Node.js 内置），不使用 Jest 或 Vitest
- 测试文件：与源码同目录的 `*.test.ts` 或 `__tests__/` 目录
- 运行：`npm test`
- 优先使用临时目录而不是提交 fixture。测试不应依赖网络、浏览器和凭证

### 分层测试要求

| 层级 | 要求 | 说明 |
|------|------|------|
| **共享库（packages/）** | **必须有测试** | sc-md、sc-chrome-cdp 是所有 Skill 的基础，核心逻辑覆盖率不低于 80% |
| **有独立逻辑的 Skill** | **建议有测试** | 如 sc-imagine 的 provider 适配层、sc-pipeline 的状态机、sc-publish-* 的核心逻辑 |
| **纯文档/胶水层 Skill** | **不强制** | sc-web-ai、sc-cover-image、sc-article-illustrator、sc-xhs-images 等主要是调用约定和 prompt 工程，测试价值低 |

### 测试驱动原则（非严格 TDD）

- 修改核心共享库时，**先确保现有测试通过**，再补新功能的测试
- 修复 bug 时，**先写一个能复现 bug 的测试**，再修复代码
- 新增共享库功能时，建议**先写测试用例明确预期**，再写实现
- 文档型和胶水型 Skill 不强求，把精力放在用户体验和文档质量上

### CI 要求
- 每次 push 和 PR 都会自动跑测试
- 测试不通过的 PR 不能合并
- 详见 `.github/workflows/test.yml`

## 临时目录约定

所有 super-creator skills 使用 **`.super/`**（不是 `.course/`）作为**过程产物**（中间文件、草稿、状态、提示词）的根目录。最终交付物默认输出到 **`posts/`**。

### 核心分离

```
.super/{项目标题}/    ← 过程产物（隐藏，gitignored）
posts/{项目标题}/     ← 最终交付物（用户可见）
```

- `{项目标题}`：使用中文的实际内容标题，去掉特殊字符（不含 `/ \ : * ? " < > |`）
- `.super/` 和 `posts/` 目录按项目名一一对应
- `.super/` 可以随时删除，不会丢失最终成果

## 目录结构（.super/）

流水线模式项目按阶段组织文件：

```
.super/{项目标题}/
├── state.json             # 流水线状态（进度、检查点、错误）
├── input/                 # 原始素材（Markdown）
├── mining/                # 选题挖掘输出（topics.md）
├── draft/                 # 内容写作（content.md、outline.md、image-spec.yaml）
├── images/                # 视觉生成（images + prompts/）
├── review/                # 内容审核（report.md）
├── publish/               # 格式转换 + 发布日志
└── analytics/             # 发布后分析（report.md）
```

每个 Skill 属于一个主要阶段，只写入自己的阶段目录。Skill 通过约定路径读取上游阶段目录 —— 不直接进行 Skill 间调用。

### 最终交付物结构（posts/）

```
posts/{项目标题}/
├── content.md             # 主内容文件
├── caption.txt            # 补充文件（可选）
└── images/                # 图片（可选）
    └── ...
```

当流水线阶段确认完成后，最终输出从 `.super/` 复制到 `posts/`。过程文件（提示词、分块、状态）不复制。

### 单 Skill vs 流水线模式

| 模式 | 使用场景 | 目录约定 | 状态文件 |
|------|---------|---------|---------|
| 单 Skill | 直接调用单个 Skill | 输出到用户指定或 Skill 默认位置 | 无 |
| 流水线 | 多阶段工作流（如 sc-pipeline 用于公众号/小红书） | 严格的 `.super/` 阶段目录 + `posts/` 输出 | `state.json` |

### 首次确认

流水线模式首次运行时只确认**项目名称**。其他设置都有合理默认值，后续可以调整。

## 图片生成优先级（v3.4.0+）

| 优先级 | 方式 | Skill | 说明 |
|--------|------|-------|------|
| 1（首选） | 网页 AI | `sc-web-ai` | 免费，不需要 API Key，效果好 |
| 2（次选） | 官方 API | `sc-imagine` | 批量生成、需要参考图时使用 |

**重要：** 不要默认使用混元 DashScope，效果不佳，已从自动 fallback 中移除。完整策略见 `docs/image-generation-priority.md`。

## Commit 规范

使用[约定式提交](https://www.conventionalcommits.org/)：

```
<type>(<scope>): <description>
```

类型：`feat`、`fix`、`refactor`、`perf`、`docs`、`test`、`chore`。scope 是 Skill 名称或 `project`。

```
feat(cover-image): 添加水彩风格
fix(publish-xhs): 处理话题标签中的特殊字符
docs(project): 更新架构文档
```

## 分支和 PR

使用 Git Flow 模型：`main`（生产）、`develop`（集成）、`feature/*`、`release/*`、`hotfix/*`。

- 从 `develop` 创建功能分支。CI 通过后通过 PR 合并
- 使用 `--no-ff` 合并以保留分支历史
- PR 应包含清晰的变更描述并关联相关 issue
- `npm install` 时自动安装 Git hooks（通过 `prepare` 脚本）

## 添加新 Skill

1. 创建 `skills/<name>/SKILL.md`，包含 YAML frontmatter（name、description、version）
2. 如果需要，在 `skills/<name>/scripts/` 中添加 TypeScript
3. 在 `.claude-plugin/marketplace.json` 的 `super-creator` 插件下注册
4. 完整要求见 `docs/creating-skills.md`

## MCP 浏览器工具使用

- 优先使用 IDE 内置的 `integrated_browser` MCP（TRAE 已内置）
- 如果内置不可用，再安装 `@playwright/mcp`
- 不要自己写反向工程代码或 CDP 调用（sc-gemini-web 已删除）
- 用户只需要在 IDE 浏览器中登录 Gemini/ChatGPT 即可免费生图
