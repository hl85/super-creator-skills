# Super-Creator 目录架构与 Skill 协作规范 v1.0

## 概述

本文档定义 super-creator-skills 的统一目录架构和 skill 间协作规范，目标是：

1. **过程产物与最终产物严格分离**：过程文件不污染用户工作目录
2. **Skill 间协作标准化**：通过约定的目录和文件格式衔接，减少耦合
3. **用户体验一致**：所有 skill 的输出模式可预期，首次使用只需确认项目名
4. **可扩展**：新增 skill 或 pipeline 时遵循同一套规范

---

## 一、整体目录结构

```
{workspace}/
├── .super/                        # 过程产物（隐藏，不提交到 git）
│   └── {project-title}/           # 按项目/主题组织，与 posts/ 一一对应
│       ├── state.json             # 流水线状态文件（仅 pipeline 模式有）
│       ├── input/                 # 原始输入素材
│       ├── mining/                # 选题挖掘阶段
│       ├── draft/                 # 内容写作阶段
│       ├── images/                # 视觉生成阶段
│       ├── review/                # 内容审核阶段
│       ├── publish/               # 发布阶段
│       └── analytics/             # 数据分析阶段
│
├── posts/                         # 最终交付产物（用户可见）
│   └── {project-title}/           # 按项目/主题组织
│       ├── {content-files}        # 文章、文案、图片等
│       └── images/                # 配图（如果有）
│
└── .githooks/                     # Git hooks（版本控制）
    ├── pre-commit
    └── pre-push
```

### 核心原则

- **`.super/` 存过程**：所有草稿、prompts、状态文件、中间结果都在这里
- **`posts/` 存结果**：用户最终拿到的、可以直接使用的产物
- **一一对应**：`.super/AI-Agent入门/` 对应 `posts/AI-Agent入门/`
- **可清理性**：`.super/` 可以随时整个删除，不影响最终成果

---

## 二、命名规范

### 项目目录名

- 使用**中文原名**，去掉特殊字符（如 `/`、`\`、`:`、`*`、`?`、`"`、`<`、`>`、`|` 等）
- 保留空格、中文标点（如 `、` `《》` `——`）
- 示例：
  - `小红书面试技巧` ✅
  - `AI Agent 入门指南` ✅
  - `2024/技术总结` → `2024技术总结`（去掉 `/`）
  - `你好？世界！` → `你好世界`（去掉 `？` `！`，因为是文件系统非法字符）

### 非法字符清理规则

以下字符在目录名中必须移除或替换：

| 字符 | 处理方式 |
|------|---------|
| `/` `\` | 移除 |
| `:` `*` `?` `"` `<` `>` `\|` | 移除 |
| 行首/行尾的空格、`.` | 移除 |
| 连续空格 | 合并为单个空格 |

---

## 三、过程产物目录详解（.super/）

### 目录结构

```
.super/{project-title}/
├── state.json                    # 流水线状态文件（仅 pipeline 模式）
├── input/
│   ├── source-{slug}.md          # 原始素材（Markdown 格式）
│   └── ...
├── mining/
│   └── topics.md                 # 选题清单
├── draft/
│   ├── outline.md                # 大纲
│   ├── content.md                # 终稿
│   ├── caption.txt               # 发布文案（纯文本，可选）
│   └── image-spec.yaml           # 配图规格说明（给视觉 skill，可选）
├── images/
│   ├── prompts/                  # 生成 prompts（过程文件）
│   ├── batch.json                # 批量生成配置（可选）
│   └── {images}.png/webp         # 生成的图片（过程版本）
├── review/
│   └── report.md                 # 审核报告
├── publish/
│   ├── article.html              # 公众号 HTML（格式转换产物）
│   ├── thread.json               # X thread JSON
│   ├── compressed/               # 压缩后的图片
│   └── publish-log.md            # 发布记录
└── analytics/
    └── report.md                 # 数据分析报告
```

### 各阶段说明

| 阶段 | 目录 | 主要 Skill | 核心输出 | 说明 |
|------|------|-----------|---------|------|
| 素材采集 | `input/` | url-to-markdown, yt-transcript, x-to-markdown | `source-{slug}.md` | 所有原始素材统一为 Markdown 格式 |
| 选题挖掘 | `mining/` | content-mining, idea-radar | `topics.md` | 选题清单，包含标题、角度、核心观点 |
| 内容写作 | `draft/` | writeflow, format-markdown | `content.md` + `outline.md` | 终稿和大纲；可选配图规格和发布文案 |
| 视觉生成 | `images/` | article-illustrator, cover-image, xhs-images, comic, slide-deck, infographic | 图片文件 + `prompts/` | 所有视觉类 skill 的过程产物 |
| 内容审核 | `review/` | content-review | `report.md` | 审核结果和修改建议 |
| 格式转换 | `publish/` | markdown-to-html, markdown-to-thread, compress-image | 各平台格式文件 | 发布前的格式转换和优化 |
| 发布 | `publish/` | post-to-wechat, post-to-x, post-to-weibo, post-to-xhs, multi-publish | `publish-log.md` | 发布结果、链接、错误记录 |
| 数据分析 | `analytics/` | post-analytics | `report.md` | 发布后数据回收和分析 |

### state.json（流水线状态文件）

**仅 pipeline 模式有**，单 skill 模式不使用。

作用：
- 记录当前进度和阶段状态
- 记录用户确认的 checkpoint
- 支持断点续跑和阶段回退
- 记录所有产物的路径索引

Schema 参考 xhs-pipeline 的 `pipeline-state.json`，后续统一各 pipeline 时再细化。

---

## 四、最终产物目录详解（posts/）

### 目录结构

```
posts/{project-title}/
├── {main-content}.md              # 主内容文件（文章/文案等）
├── {supplementary-files}          # 辅助文件（caption.txt 等）
└── images/                        # 配图（如果有）
    ├── 01-cover.png
    ├── 02-content.png
    └── ...
```

### 不同内容类型的输出结构

#### 小红书图文

```
posts/小红书面试技巧/
├── content.md                    # 完整文案（Markdown）
├── caption.txt                   # 纯文案（用于发布）
└── images/
    ├── 01-cover.png
    ├── 02-content.png
    └── ...
```

#### 公众号文章

```
posts/AI-Agent入门/
├── article.md                    # 原文（Markdown）
├── article.html                  # 发布用 HTML
└── images/
    └── ...
```

#### 幻灯片

```
posts/技术分享-Agent架构/
├── slides.pptx                   # PPT 文件
├── slides.pdf                    # PDF 版本
└── images/
    ├── slide-01.png
    └── ...
```

#### 知识漫画

```
posts/图灵传/
├── comic.pdf                     # 合订 PDF
└── pages/
    ├── 01-cover.png
    ├── 02-page-1.png
    └── ...
```

### 过程 → 最终的迁移规则

当一个阶段完成，且用户确认后，产物从 `.super/` 迁移到 `posts/`：

- **不是移动（move），是复制（copy）**——过程产物保留在 `.super/` 中供回溯
- 只迁移"最终版"的文件，过程文件（如 prompts、drafts、chunks）不迁移
- 迁移时机：用户确认该阶段完成后
- pipeline 模式下，最终产物在 pipeline 结束时统一迁移到 `posts/`

---

## 五、Skill 协作规范

### 核心思想：阶段契约制

每个 skill 属于一个固定的**主阶段**。skill 通过**契约文件**（约定路径 + 约定格式）与上下游衔接，不需要知道其他 skill 的存在。

```
上游 skill → [契约文件] → 当前 skill → [契约文件] → 下游 skill
```

### Skill 与阶段对应表

| 主阶段 | Skill | 输入契约 | 输出契约 |
|--------|-------|---------|---------|
| 素材采集 | url-to-markdown | URL / 用户输入 | `input/source-{slug}.md` |
| 素材采集 | yt-transcript | YouTube URL | `input/source-{slug}.md` |
| 素材采集 | x-to-markdown | X URL | `input/source-{slug}.md` |
| 选题挖掘 | content-mining | `input/source-*.md` | `mining/topics.md` |
| 选题挖掘 | idea-radar | - | `mining/ideas.jsonl` |
| 内容写作 | writeflow | `mining/topics.md` + `input/` | `draft/content.md` + `draft/outline.md` |
| 内容写作 | format-markdown | `draft/content.md` | `draft/content.md`（格式化后，覆盖） |
| 视觉生成 | article-illustrator | `draft/content.md` + `draft/image-spec.yaml` | `images/` 下的图片 |
| 视觉生成 | cover-image | `draft/content.md` | `images/cover.png` |
| 视觉生成 | xhs-images | `draft/content.md` + `draft/image-spec.yaml` | `images/` 下的系列图片 |
| 视觉生成 | comic | `draft/content.md` | `images/comic/` 下的图片 |
| 视觉生成 | slide-deck | `draft/content.md` | `images/slides/` 下的幻灯片图片 |
| 视觉生成 | infographic | `draft/content.md` | `images/infographic.png` |
| 内容审核 | content-review | `draft/content.md` | `review/report.md` |
| 格式转换 | markdown-to-html | `draft/content.md` | `publish/article.html` |
| 格式转换 | markdown-to-thread | `draft/content.md` | `publish/thread.json` |
| 格式转换 | compress-image | `images/*.png` | `publish/compressed/` 下的图片 |
| 发布 | post-to-xhs | `draft/caption.txt` + `images/` | `publish/publish-log.md` |
| 发布 | post-to-wechat | `publish/article.html` + `images/` | `publish/publish-log.md` |
| 发布 | post-to-x | `publish/thread.json` | `publish/publish-log.md` |
| 发布 | post-to-weibo | `draft/content.md` + `images/` | `publish/publish-log.md` |
| 发布 | multi-publish | `draft/content.md` + `images/` | `publish/` 下各平台子目录 |
| 数据分析 | post-analytics | 发布链接 | `analytics/report.md` |

### 协作规则

**规则 1：主阶段唯一**

每个 skill 只有一个主阶段，其主要输出必须写入该阶段目录。skill 可以读取多个上游阶段的输出，但不能写入其他阶段的目录。

**规则 2：通过契约文件衔接，不直接调用**

Skill 之间不直接互相调用，而是通过文件系统的约定路径衔接。例如：
- writeflow 输出 `draft/image-spec.yaml`
- xhs-images 读取 `draft/image-spec.yaml`
- 两者不需要知道对方的存在，只需要知道契约文件的位置和格式

**规则 3：Pipeline 是编排者，不是执行者**

Pipeline skill（xhs-pipeline、multi-publish）的职责：
1. 按顺序调用各阶段的 skill
2. 管理 `state.json`（进度、checkpoint、错误）
3. 处理用户确认
4. 将最终产物迁移到 `posts/`

Pipeline **不直接产生内容**——内容都由各阶段 skill 产生。

**规则 4：两种模式并存**

| 模式 | 适用场景 | 目录规范 | 状态管理 |
|------|---------|---------|---------|
| **单 skill 模式** | 用户直接调用单个 skill（如"生成封面图"） | 输出目录由用户指定或 skill 默认，不强制走 `.super/` | 无 |
| **Pipeline 模式** | 多阶段流水线（如"跑一篇小红书"） | 严格遵循 `.super/` 阶段目录规范 | 有（`state.json`） |

单 skill 模式是轻量模式，满足简单需求；pipeline 模式是重度模式，满足完整内容生产流程。

**规则 5：首次使用只确认项目名**

Pipeline 模式第一次启动时，只向用户确认**项目名称**：
- 其他配置（输出位置、内容类型等）都有合理默认值
- 用户需要调整时可以随时改
- 项目名决定了 `.super/{name}/` 和 `posts/{name}/` 的目录名

---

## 六、Git Hooks 规范

### 目录位置

根目录 `.githooks/`（纳入版本控制）

### 自动安装

通过 `package.json` 的 `prepare` 脚本自动配置：

```json
{
  "scripts": {
    "prepare": "node scripts/install-git-hooks.mjs"
  }
}
```

`npm install` 时自动执行，将 `core.hooksPath` 设置为 `.githooks/`。

### Hook 列表

| Hook | 脚本 | 作用 |
|------|------|------|
| `pre-commit` | `scripts/verify-version-sync.mjs` | 提交前检查版本一致性 |
| `pre-push` | `scripts/sync-shared-skill-packages.mjs --enforce-clean` | 推送前确保 vendor 包是最新的 |

### 安装脚本

`scripts/install-git-hooks.mjs` 负责执行 `git config core.hooksPath .githooks`。

---

## 七、首次使用流程（用户视角）

### Pipeline 模式

```
用户："帮我跑一篇小红书，内容是关于 AI Agent 面试的"

1. Agent 确认项目名：
   "项目名就叫「AI Agent 面试技巧」可以吗？"

2. 用户确认后，自动创建：
   .super/AI Agent 面试技巧/
   posts/AI Agent 面试技巧/

3. 按 pipeline 流程依次执行各阶段，每步确认

4. 最终产物自动迁移到：
   posts/AI Agent 面试技巧/
```

### 单 skill 模式

```
用户："帮我生成一张封面图"

1. Agent 直接生成图片，输出到用户指定位置或默认位置
2. 不创建 .super/ 目录
3. 不走阶段规范
```

---

## 八、与现有实现的迁移路径

当前已有实现与新规范的差异和迁移计划：

| 项 | 当前状态 | 目标规范 | 迁移难度 | 状态 |
|----|---------|---------|---------|------|
| Git hooks 位置 | `ops/githooks/` | `.githooks/` | ⭐ 低 | ✅ 已完成 |
| 自动安装 | 手动执行脚本 | `prepare` 脚本自动执行 | ⭐ 低 | ✅ 已完成 |
| `.gitignore` 配置 | 无 `.super/` 规则 | 添加 `.super/` 忽略 | ⭐ 低 | ✅ 已完成 |
| AGENTS.md 规范声明 | 简单说明 | 完整目录架构规范 | ⭐ 低 | ✅ 已完成 |
| xhs-pipeline 目录 | `.super/xhs-{slug}/` 平铺 | `.super/{title}/` 按阶段分子目录 | ⭐⭐⭐ 高 | ✅ 已完成 |
| comic 输出 | `comic/{slug}/`（用户可见） | 过程在 `.super/{title}/images/`，最终在 `posts/{title}/` | ⭐⭐ 中 | ⏳ 待迁移 |
| article-illustrator 输出 | `illustrations/{slug}/`（用户可见） | 同上 | ⭐⭐ 中 | ⏳ 待迁移 |
| cover-image 输出 | `cover-image/{slug}/`（用户可见） | 同上 | ⭐⭐ 中 | ⏳ 待迁移 |
| 其他 skill | 各自为政 | 单 skill 模式不变，pipeline 模式走新规范 | ⭐ 低 | ✅ 无需改动 |

### 迁移策略

1. **先做基础层**：Git hooks 迁移、`.gitignore` 配置、AGENTS.md 文档更新 ✅
2. **再做规范层**：在 `AGENTS.md` 和 `docs/` 中明确定义新规范 ✅
3. **最后做迁移**：从 xhs-pipeline 开始，逐步将各 pipeline 和 skill 迁移到新规范 ✅（xhs-pipeline 已完成）
4. **向后兼容**：单 skill 模式保持现有行为不变，不强制迁移

---

## 九、Gitignore 配置

`.gitignore` 中需要添加/确认的规则：

```gitignore
# Super-creator 过程产物
.super/

# Super-creator 最终产物（可选，用户可能想提交）
# posts/

# AI IDE 临时文件
.claude/
.trae/
.sisyphus/
```

**关于 `posts/` 的说明**：`posts/` 是否加入 gitignore 由用户决定——有些用户可能想把最终产物提交到仓库，有些不想。默认**不加入** gitignore（即默认纳入版本控制），用户可以自行添加。

---

## 十、总结

| 维度 | 规范 |
|------|------|
| 过程产物根目录 | `.super/{project-title}/` |
| 最终产物根目录 | `posts/{project-title}/` |
| 项目命名 | 中文原名，去掉特殊字符 |
| 过程组织方式 | 按阶段分目录（input/mining/draft/images/review/publish/analytics，共 8 个阶段） |
| Skill 协作 | 阶段契约制：每个 skill 一个主阶段，通过契约文件衔接 |
| 状态管理 | 仅 pipeline 级别有（`state.json`），单 skill 无 |
| 首次确认 | 只确认项目名 |
| Git hooks | 根目录 `.githooks/`，npm prepare 自动安装 |
| 两种模式 | 单 skill 模式（轻量）+ Pipeline 模式（重度） |
