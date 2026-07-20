# SC Pipeline 状态管理机制

状态文件是 sc-pipeline 的核心记忆机制，确保流水线可中断、可续跑、可回溯。支持双平台（xhs / wechat）。

---

## 1. 状态文件完整 Schema

### 文件位置

```
.super/{project-title}/state.json
```

所有路径均为**相对于项目根目录**的相对路径，保证可移植。

### 目录结构总览

#### 小红书（xhs）目录结构

```
.super/{project-title}/
├── state.json               # 状态文件（核心）
├── input/                   # 原始输入素材
├── mining/                  # 挖掘阶段输出
│   └── topics.md
├── draft/                   # 写作阶段输出
│   ├── outline.md
│   ├── content.md
│   └── caption.txt
├── images/                  # 生图阶段输出（原始 PNG/JPG）
│   ├── prompts/
│   ├── 01-cover.png
│   └── ...
├── review/                  # 审核阶段（硬闸门）
│   ├── review-report.md
│   └── images/              # 压缩后的 WebP 图片
│       ├── 01-cover.webp
│       └── ...
└── publish/                 # 发布阶段
    └── PUBLISH-MANUAL.md

posts/{project-title}/       # 最终交付物（pipeline 完成后迁移）
├── content.md
├── caption.txt
└── images/
    ├── 01-cover.webp
    └── ...
```

#### 微信公众号（wechat）目录结构

```
.super/{project-title}/
├── state.json               # 状态文件（核心）
├── input/                   # 原始输入素材
├── mining/                  # 挖掘阶段输出
│   └── topics.md
├── draft/                   # 写作阶段输出
│   ├── outline.md
│   ├── content.md
│   └── summary.txt
├── visuals/                 # 视觉阶段输出
│   ├── cover.webp           # 封面图
│   ├── fig-01.webp          # 文章配图
│   └── ...
├── review/                  # 审核阶段（硬闸门）
│   ├── formatted.md         # 排版格式化后的文章
│   ├── review-report.md
│   └── images/              # 压缩后的图片
│       ├── cover.webp
│       ├── fig-01.webp
│       └── ...
└── publish/                 # 发布阶段

posts/{project-title}/       # 最终交付物（pipeline 完成后迁移）
├── content.md               # 排版后最终版
├── summary.txt
├── cover.webp
└── images/
    ├── fig-01.webp
    └── ...
```

---

### 顶层字段说明

| 字段 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `pipeline_id` | string | ✅ | 唯一标识，格式 `{platform}-{日期}-{topic-slug}-{短随机串}` |
| `platform` | string | ✅ | 目标平台：`"xhs"` 或 `"wechat"` |
| `project_title` | string | ✅ | 项目名（中文），用于目录命名和展示 |
| `topic_slug` | string | ✅ | 主题 slug（英文 kebab-case），用于 ID 生成 |
| `current_stage` | string | ✅ | 当前阶段，见「阶段定义」 |
| `publish_mode` | string | ✅ | 发布模式：`manual`（手动发布，推荐）/ `auto`（自动发布，有风控风险）。双平台统一，决定是否启用自动化发布链路 |
| `publish_action` | string | ✅ | 发布动作：`draft`（推送到草稿箱/预览，推荐）/ `live`（直接发布/群发）。Stage 5 输入字段，决定具体发布动作 |
| `version` | string | ✅ | 状态文件语义版本，当前为 `"4.0.0"` |
| `output_dir` | string | ✅ | 最终产物输出目录，默认 `posts/{project-title}/` |
| `metadata` | object | ✅ | 元数据 |
| `stages` | array | ✅ | 各阶段状态数组（根据 platform 初始化不同列表） |
| `checkpoints` | array | ✅ | 用户确认记录 |
| `artifacts` | object | ✅ | 所有产出物路径索引 |

### stages 数组初始化

根据 `platform` 不同，stages 数组初始化为不同的阶段列表：

**platform = "xhs"**：
```json
["mining", "writing", "imaging", "review", "publishing"]
```

**platform = "wechat"**：
```json
["mining", "writing", "visuals", "review", "publishing"]
```

### 阶段状态 (status)

| 状态 | 说明 |
|------|------|
| `pending` | 待开始 |
| `in_progress` | 进行中 |
| `completed` | 已完成（产出已就绪，待用户确认） |
| `failed` | 失败，有错误记录 |
| `skipped` | 已跳过 |

### 阶段定义 (name)

#### 小红书（xhs）阶段

| 阶段名 | 说明 | 对应目录 | 对应 Skill |
|--------|------|---------|-----------|
| `mining` | 内容挖掘 | `mining/` | sc-content-mining |
| `writing` | 文案撰写 | `draft/` | sc-writer -p xhs |
| `imaging` | 信息图生成 | `images/` | sc-xhs-images |
| `review` | 审核（硬闸门） | `review/` | sc-content-review + sc-compress-image |
| `publishing` | 发布 | `publish/` | sc-publish-xhs / xiaohongshu-mcp |

#### 微信公众号（wechat）阶段

| 阶段名 | 说明 | 对应目录 | 对应 Skill |
|--------|------|---------|-----------|
| `mining` | 内容挖掘 | `mining/` | sc-content-mining |
| `writing` | 文案撰写 | `draft/` | sc-writer -p wechat |
| `visuals` | 视觉素材生成 | `visuals/` | sc-cover-image + sc-article-illustrator |
| `review` | 审核（硬闸门） | `review/` | sc-format-markdown + sc-content-review + sc-compress-image |
| `publishing` | 发布 | `publish/` | sc-publish-wechat |

> 注：没有 `done` 阶段。当 `publishing` 阶段状态为 `completed` 且有对应 checkpoint 时，表示全流程完成。最终产物会复制到 `posts/{project-title}/`。

---

### 示例：XHS 平台状态文件

```json
{
  "pipeline_id": "xhs-20240101-ai-efficiency-tips-abc123",
  "platform": "xhs",
  "project_title": "AI 效率工具入门",
  "topic_slug": "ai-efficiency-tips",
  "current_stage": "review",
  "publish_mode": "manual",
  "publish_action": "draft",
  "version": "4.0.0",
  "metadata": {
    "created_at": "2024-01-01T10:00:00Z",
    "updated_at": "2024-01-01T11:30:00Z",
    "schema_version": "4.0.0",
    "created_by": "sc-pipeline"
  },
  "stages": [
    {
      "name": "mining",
      "status": "completed",
      "started_at": "2024-01-01T10:00:00Z",
      "completed_at": "2024-01-01T10:45:00Z",
      "inputs": {
        "brainstorm": {
          "platform": "xiaohongshu",
          "audience": "职场白领",
          "tone": "干货实用",
          "scope": "AI 效率课程第 1-3 章",
          "core_logic": "用 AI 工具每天省出 2 小时"
        }
      },
      "outputs": {
        "mining_output": ".super/AI 效率工具入门/mining/topics.md",
        "selected_topic_index": 1
      },
      "errors": []
    },
    {
      "name": "writing",
      "status": "completed",
      "started_at": "2024-01-01T11:00:00Z",
      "completed_at": "2024-01-01T11:20:00Z",
      "inputs": {
        "source": ".super/AI 效率工具入门/mining/topics.md",
        "topic_index": 1,
        "platform": "xhs"
      },
      "outputs": {
        "outline": ".super/AI 效率工具入门/draft/outline.md",
        "content": ".super/AI 效率工具入门/draft/content.md",
        "caption": ".super/AI 效率工具入门/draft/caption.txt"
      },
      "errors": []
    },
    {
      "name": "imaging",
      "status": "completed",
      "started_at": "2024-01-01T11:20:00Z",
      "completed_at": "2024-01-01T11:30:00Z",
      "inputs": {
        "content_file": ".super/AI 效率工具入门/draft/content.md",
        "style": "notion",
        "layout": "dense"
      },
      "outputs": {
        "images": [
          ".super/AI 效率工具入门/images/01-cover.png",
          ".super/AI 效率工具入门/images/02-tools.png",
          ".super/AI 效率工具入门/images/03-workflow.png"
        ],
        "style_used": "notion",
        "layout_used": "dense"
      },
      "errors": []
    },
    {
      "name": "review",
      "status": "in_progress",
      "started_at": "2024-01-01T11:30:00Z",
      "completed_at": null,
      "inputs": {
        "content_file": ".super/AI 效率工具入门/draft/content.md",
        "caption_file": ".super/AI 效率工具入门/draft/caption.txt",
        "images": [".super/AI 效率工具入门/images/01-cover.png", "..."],
        "platform": "xhs"
      },
      "outputs": {
        "review_passed": null,
        "critical_issues": [],
        "warning_issues": [],
        "review_report": null,
        "compressed_images": [],
        "compression_ratio": null
      },
      "errors": []
    },
    {
      "name": "publishing",
      "status": "pending",
      "started_at": null,
      "completed_at": null,
      "inputs": {},
      "outputs": {},
      "errors": []
    }
  ],
  "checkpoints": [
    {
      "stage": "mining",
      "confirmed_at": "2024-01-01T10:50:00Z",
      "confirmed_by": "user",
      "decision": "approved",
      "notes": "选题OK，选第2个"
    },
    {
      "stage": "writing",
      "confirmed_at": "2024-01-01T11:20:00Z",
      "confirmed_by": "user",
      "decision": "approved",
      "notes": "文案OK"
    },
    {
      "stage": "imaging",
      "confirmed_at": "2024-01-01T11:30:00Z",
      "confirmed_by": "user",
      "decision": "approved",
      "notes": "图片OK"
    }
  ],
  "artifacts": {
    "mining_output": ".super/AI 效率工具入门/mining/topics.md",
    "outline": ".super/AI 效率工具入门/draft/outline.md",
    "content": ".super/AI 效率工具入门/draft/content.md",
    "caption": ".super/AI 效率工具入门/draft/caption.txt",
    "images": [],
    "compressed_images": [],
    "review_report": null,
    "publish_manual": null
  },
  "output_dir": "posts/AI 效率工具入门/"
}
```

### 示例：WeChat 平台状态文件

```json
{
  "pipeline_id": "wechat-20240101-ai-agent-architecture-def456",
  "platform": "wechat",
  "project_title": "AI Agent 架构深度解析",
  "topic_slug": "ai-agent-architecture",
  "current_stage": "writing",
  "publish_mode": "manual",
  "publish_action": "draft",
  "version": "4.0.0",
  "metadata": {
    "created_at": "2024-01-01T14:00:00Z",
    "updated_at": "2024-01-01T14:30:00Z",
    "schema_version": "4.0.0",
    "created_by": "sc-pipeline"
  },
  "stages": [
    {
      "name": "mining",
      "status": "completed",
      "started_at": "2024-01-01T14:00:00Z",
      "completed_at": "2024-01-01T14:20:00Z",
      "inputs": {
        "brainstorm": {
          "platform": "wechat",
          "audience": "技术从业者",
          "tone": "深度分析",
          "scope": "AI Agent 课程全部文稿",
          "core_logic": "Agent 架构本质是工具调用循环",
          "length": "5000字"
        }
      },
      "outputs": {
        "mining_output": ".super/AI Agent 架构深度解析/mining/topics.md",
        "selected_topic_index": 0
      },
      "errors": []
    },
    {
      "name": "writing",
      "status": "in_progress",
      "started_at": "2024-01-01T14:20:00Z",
      "completed_at": null,
      "inputs": {
        "source": ".super/AI Agent 架构深度解析/mining/topics.md",
        "topic_index": 0,
        "platform": "wechat"
      },
      "outputs": {
        "outline": null,
        "content": null,
        "summary": null
      },
      "errors": []
    },
    {
      "name": "visuals",
      "status": "pending",
      "started_at": null,
      "completed_at": null,
      "inputs": {},
      "outputs": {},
      "errors": []
    },
    {
      "name": "review",
      "status": "pending",
      "started_at": null,
      "completed_at": null,
      "inputs": {},
      "outputs": {},
      "errors": []
    },
    {
      "name": "publishing",
      "status": "pending",
      "started_at": null,
      "completed_at": null,
      "inputs": {},
      "outputs": {},
      "errors": []
    }
  ],
  "checkpoints": [
    {
      "stage": "mining",
      "confirmed_at": "2024-01-01T14:20:00Z",
      "confirmed_by": "user",
      "decision": "approved",
      "notes": "选题方向OK"
    }
  ],
  "artifacts": {
    "mining_output": ".super/AI Agent 架构深度解析/mining/topics.md",
    "outline": null,
    "content": null,
    "summary": null,
    "cover_image": null,
    "illustrations": [],
    "formatted_content": null,
    "review_report": null,
    "compressed_images": {},
    "publish_result": null
  },
  "output_dir": "posts/AI Agent 架构深度解析/"
}
```

---

## 2. 各阶段输入输出契约

### Stage 1: mining（内容挖掘）— 通用

**Inputs:**
```json
{
  "brainstorm": {
    "platform": "xiaohongshu | wechat",
    "audience": "目标受众",
    "tone": "内容调性",
    "scope": "内容源范围",
    "core_logic": "核心理念一句话"
  }
}
```

> wechat 平台额外支持 `length` 字段：预期篇幅（如 "3000字"）。

**Outputs:**
```json
{
  "mining_output": ".super/{project-title}/mining/topics.md",
  "selected_topic_index": 0
}
```

**Artifacts:**
- `mining_output`: 挖掘结果 Markdown 文件（选题清单）

---

### Stage 2: writing（文案撰写）

#### XHS 平台

**Inputs:**
```json
{
  "source": ".super/{project-title}/mining/topics.md",
  "topic_index": 2,
  "platform": "xhs"
}
```

**Outputs:**
```json
{
  "outline": ".super/{project-title}/draft/outline.md",
  "content": ".super/{project-title}/draft/content.md",
  "caption": ".super/{project-title}/draft/caption.txt"
}
```

#### WeChat 平台

**Inputs:**
```json
{
  "source": ".super/{project-title}/mining/topics.md",
  "topic_index": 0,
  "platform": "wechat"
}
```

**Outputs:**
```json
{
  "outline": ".super/{project-title}/draft/outline.md",
  "content": ".super/{project-title}/draft/content.md",
  "summary": ".super/{project-title}/draft/summary.txt"
}
```

**Artifacts:**
- `outline`: 大纲文件
- `content`: 终稿 Markdown
- `caption`（xhs）: 提取的纯正文
- `summary`（wechat）: 文章摘要/导读

---

### Stage 3: 视觉生成

#### XHS — imaging（信息图生成）

**Inputs:**
```json
{
  "content_file": ".super/{project-title}/draft/content.md",
  "style": "notion | bold | cute | fresh | ...",
  "layout": "dense | flow | list | balanced | ..."
}
```

**Outputs:**
```json
{
  "images": [
    ".super/{project-title}/images/01-cover.png",
    ".super/{project-title}/images/02-xxx.png"
  ],
  "style_used": "notion",
  "layout_used": "dense"
}
```

#### WeChat — visuals（封面图+文章配图）

**Inputs:**
```json
{
  "content_file": ".super/{project-title}/draft/content.md",
  "outline_file": ".super/{project-title}/draft/outline.md",
  "cover_style": "cinematic | minimal | bold | ...",
  "article_style": "illustration | chart | photo | ..."
}
```

**Outputs:**
```json
{
  "cover_image": ".super/{project-title}/visuals/cover.webp",
  "illustrations": [
    {
      "position": "section-1",
      "path": ".super/{project-title}/visuals/fig-01.webp",
      "caption": "图1：xxx示意图",
      "alt": "xxx"
    }
  ]
}
```

**Artifacts:**
- xhs: `images` — 生成的图片路径数组（按顺序，第1张为封面）
- wechat: `cover_image` + `illustrations` — 封面图和配图文集

---

### Stage 4: review（审核/硬闸门）

#### XHS 平台

**Inputs:**
```json
{
  "content_file": ".super/{project-title}/draft/content.md",
  "caption_file": ".super/{project-title}/draft/caption.txt",
  "images": [".super/{project-title}/images/01-cover.png", "..."],
  "platform": "xhs"
}
```

**Outputs:**
```json
{
  "review_passed": true,
  "critical_issues": [],
  "warning_issues": [
    {
      "type": "wording",
      "location": "第3段",
      "message": "表述可优化",
      "severity": "warning"
    }
  ],
  "review_report": ".super/{project-title}/review/review-report.md",
  "compressed_images": [
    ".super/{project-title}/review/images/01-cover.webp",
    ".super/{project-title}/review/images/02-xxx.webp"
  ],
  "compression_ratio": "65%",
  "total_size_before": "5.2MB",
  "total_size_after": "1.8MB"
}
```

#### WeChat 平台

**Inputs:**
```json
{
  "content_file": ".super/{project-title}/draft/content.md",
  "cover_image": ".super/{project-title}/visuals/cover.webp",
  "illustrations": [
    {
      "position": "section-1",
      "path": ".super/{project-title}/visuals/fig-01.webp",
      "caption": "图1：xxx示意图"
    }
  ],
  "platform": "wechat"
}
```

**Outputs:**
```json
{
  "formatted_content": ".super/{project-title}/review/formatted.md",
  "format_warnings": [],
  "review_passed": true,
  "critical_issues": [],
  "warning_issues": [],
  "review_report": ".super/{project-title}/review/review-report.md",
  "compressed_images": {
    "cover": ".super/{project-title}/review/images/cover.webp",
    "illustrations": [".super/{project-title}/review/images/fig-01.webp"]
  },
  "total_size_before": "8.5MB",
  "total_size_after": "2.1MB"
}
```

**Artifacts:**
- `review_report`: 审核报告
- `compressed_images`: 压缩后的 WebP 图片
- `formatted_content`（wechat）: 排版格式化后的文章

---

### Stage 5: publishing（发布）

#### XHS 平台

**Inputs:**
```json
{
  "title": "笔记标题",
  "caption_file": ".super/{project-title}/draft/caption.txt",
  "images": [".super/{project-title}/review/images/01-cover.webp", "..."],
  "tags": ["标签1", "标签2", "标签3"],
  "method": "mcp | cdp | manual",
  "publish_action": "draft | live"
}
```

**Outputs:**
```json
{
  "published": true,
  "post_url": "https://www.xiaohongshu.com/discovery/item/...",
  "method_used": "mcp",
  "publish_manual": ".super/{project-title}/publish/PUBLISH-MANUAL.md"
}
```

#### WeChat 平台

**Inputs:**
```json
{
  "content_file": ".super/{project-title}/review/formatted.md",
  "cover_image": ".super/{project-title}/review/images/cover.webp",
  "summary": ".super/{project-title}/draft/summary.txt",
  "images_dir": ".super/{project-title}/review/images/",
  "publish_action": "draft | live",
  "original": true,
  "author": "作者名"
}
```

**Outputs（草稿模式）:**
```json
{
  "published": false,
  "draft_id": "草稿ID",
  "media_id": "素材ID",
  "preview_url": "预览链接（如有）",
  "method_used": "api",
  "status": "draft_created"
}
```

**Outputs（群发模式）:**
```json
{
  "published": true,
  "post_url": "https://mp.weixin.qq.com/s/...",
  "msg_id": "群发消息ID",
  "method_used": "api",
  "status": "published"
}
```

> **method_used 字段**：双平台统一字段，记录实际采用的发布方式。
> - xhs: `mcp` / `cdp` / `manual`
> - wechat: `api` / `browser` / `manual`

**Artifacts:**
- xhs: `publish_manual` — 手动发布手册（fallback 时生成）
- wechat: `publish_result` — 发布结果（草稿ID或文章链接）
- wechat: `publish_manual` — 手动发布手册（fallback 时生成，与 xhs 一致）

---

### 最终产物迁移

Pipeline 全流程完成（publishing 阶段 confirmed）后，将最终产物从 `.super/` 复制到 `posts/`：

**XHS:**
```
.super/{project-title}/draft/content.md    → posts/{project-title}/content.md
.super/{project-title}/draft/caption.txt   → posts/{project-title}/caption.txt
.super/{project-title}/review/images/*.webp → posts/{project-title}/images/
```

**WeChat:**
```
.super/{project-title}/review/formatted.md → posts/{project-title}/content.md
.super/{project-title}/draft/summary.txt   → posts/{project-title}/summary.txt
.super/{project-title}/review/images/cover.webp → posts/{project-title}/cover.webp
.super/{project-title}/review/images/fig-*.webp → posts/{project-title}/images/
```

- 是**复制**不是移动——过程产物保留在 `.super/` 中供回溯
- 只复制最终版文件，过程文件（prompts、state.json 等）不复制

---

## 3. 状态转移图

### 合法的阶段切换路径（XHS）

```
mining → writing → imaging → review(硬闸门) → publishing → ✅ 完成
```

### 合法的阶段切换路径（WeChat）

```
mining → writing → visuals → review(硬闸门) → publishing → ✅ 完成
```

### 通用状态机（每个阶段内部）

```
                    ┌─────────────┐
                    │   pending   │
                    └──────┬──────┘
                           │
                        开始
                           ▼
                    ┌─────────────┐
                    │ in_progress │
                    └──────┬──────┘
                           │
                  ┌────────┴────────┐
                  │                 │
                成功               失败
                  ▼                 ▼
            ┌──────────┐     ┌──────────┐
            │completed │     │ failed   │
            └─────┬────┘     └────┬─────┘
                  │               │
            用户确认           重试/跳过
                  │               │
       ┌──────────┼──────────┐    ▼
       │          │          │ 回退到
    通过      要求修改    跳过  in_progress
       │          │
       ▼          ▼
  下一阶段    in_progress
  (pending)   （重新执行）
```

### 状态转移规则表（双平台通用）

> 注：XHS 第三阶段为 `imaging`，WeChat 第三阶段为 `visuals`，规则模式相同。

| 当前阶段 | 当前状态 | 操作 | 目标阶段 | 目标状态 |
|---------|---------|------|---------|---------|
| mining | pending | 开始挖掘 | mining | in_progress |
| mining | in_progress | 挖掘完成 | mining | completed |
| mining | in_progress | 挖掘失败 | mining | failed |
| mining | completed | 用户确认通过 | writing | pending |
| mining | completed | 用户要求修改 | mining | in_progress |
| mining | failed | 重试 | mining | in_progress |
| mining | failed | 跳过 | writing | pending |
| writing | pending | 开始写文 | writing | in_progress |
| writing | in_progress | 写文完成 | writing | completed |
| writing | in_progress | 写文失败 | writing | failed |
| writing | completed | 用户确认通过 | imaging/visuals | pending |
| writing | completed | 用户要求修改 | writing | in_progress |
| writing | failed | 重试 | writing | in_progress |
| writing | failed | 跳过 | imaging/visuals | pending |
| imaging/visuals | pending | 开始生成 | imaging/visuals | in_progress |
| imaging/visuals | in_progress | 生成完成 | imaging/visuals | completed |
| imaging/visuals | in_progress | 生成失败 | imaging/visuals | failed |
| imaging/visuals | completed | 用户确认通过 | review | pending |
| imaging/visuals | completed | 用户要求修改 | imaging/visuals | in_progress |
| imaging/visuals | failed | 重试 | imaging/visuals | in_progress |
| imaging/visuals | failed | 跳过 | review | pending |
| review | pending | 开始审核 | review | in_progress |
| review | in_progress | 审核通过 | review | completed |
| review | in_progress | 发现 critical 问题 | review | in_progress（修复后重审） |
| review | in_progress | 审核失败 | review | failed |
| review | completed | 用户确认通过 | publishing | pending |
| review | completed | 用户要求修改 | 对应修改阶段 | in_progress |
| review | failed | 重试 | review | in_progress |
| publishing | pending | 开始发布 | publishing | in_progress |
| publishing | in_progress | 发布完成 | publishing | completed |
| publishing | in_progress | 发布失败 | publishing | failed |
| publishing | completed | 用户确认发布成功 → 迁移产物到 posts/ | — | — (done) |
| publishing | failed | 重试 | publishing | in_progress |

### 回退规则

支持从**任意已完成的阶段**重新开始，后续阶段状态重置为 `pending`：

- 例（xhs）：从 writing 阶段重跑 → imaging、review、publishing 重置为 pending
- 例（wechat）：从 writing 阶段重跑 → visuals、review、publishing 重置为 pending
- 例：从 review 阶段发现 critical 问题需改文案 → 回到 writing in_progress，visuals/imaging 及之后重置

---

## 4. Checkpoint 确认机制

### 什么是 Checkpoint

每个 Stage 产出完成后，必须经过用户确认才能进入下一阶段。确认记录保存在 `checkpoints` 数组中。

### Checkpoint 结构

```json
{
  "stage": "mining",
  "confirmed_at": "2024-01-01T10:50:00Z",
  "confirmed_by": "user",
  "decision": "approved | revised | skipped",
  "notes": "用户备注（可选）"
}
```

### Checkpoint 标准流程

```
Stage 执行完成
      │
      ▼
写入状态（status = completed）
      │
      ▼
保存状态文件
      │
      ▼
AskUserQuestion 展示产出
      │
   ┌──┴──┐
   │     │
  确认  修改/重跑
   │     │
   ▼     ▼
写入    重置该阶段
checkpoint  status = in_progress
   │     │
   ▼     ▼
进入    重新执行
下一阶段 该阶段
```

### 关键原则

1. **先写状态，再问用户**：Stage 执行完成后，必须先写入状态文件（status=completed），再发起 AskUserQuestion
2. **确认后再推进**：用户确认后，写入 checkpoint，再将下一阶段设为 pending 并开始执行
3. **可回溯**：所有 checkpoint 都保留，不覆盖，可追溯完整决策历史
4. **硬闸门额外确认**：review 阶段除了常规 Checkpoint，还必须通过自动化闸门检查（critical=0 或用户确认放行 warning）

---

## 5. 断点续跑机制

### 如何续跑

当用户说「从状态文件继续」或「继续上次的 pipeline」时：

1. 查找 `.super/*/state.json`（glob 匹配所有项目）
2. 读取 `platform`、`current_stage` 和各阶段状态
3. 定位到**最近一个没有 checkpoint 的 completed 阶段**，或当前 in_progress 的阶段
4. 从该位置继续执行

### 续跑场景

| 场景 | 判断依据 | 续跑行为 |
|------|---------|---------|
| 挖掘完成，等确认 | mining=completed，无 mining checkpoint | 展示挖掘结果，请求确认 |
| 写文进行中，中断了 | writing=in_progress | 重新开始 writing 阶段 |
| 写文完成，等确认 | writing=completed，无 writing checkpoint | 展示文案，请求确认 |
| 视觉生成失败了 | imaging/visuals=failed，有错误记录 | 询问是否重试 |
| 审核中发现 critical | review=in_progress，有 critical_issues | 展示问题，引导修复 |
| 发布完成 | publishing=completed，有 checkpoint | 告知已完成，展示结果和 posts/ 路径 |

### 续跑命令示例

```bash
# 自动找到最近的 pipeline 并继续
./sc-run sc-pipeline resume

# 指定阶段恢复
./sc-run sc-pipeline resume --stage writing
```

---

## 6. 错误恢复策略

### 错误记录

阶段执行失败时，将错误信息写入 `stages[].errors` 数组：

```json
{
  "errors": [
    {
      "timestamp": "2024-01-01T11:00:00Z",
      "type": "image_generation_failed",
      "message": "第3张图生成超时",
      "retry_count": 1
    }
  ]
}
```

### 常见错误及恢复

| 错误类型 | 阶段 | 恢复策略 |
|---------|------|---------|
| 内容源文件找不到 | mining | 提示用户指定正确路径 |
| 大纲生成不完整 | writing | 重试，或手动补充后继续 |
| 图片生成超时 | imaging/visuals | 单张图重试，或减少图片数量 |
| 审核 critical 问题 | review | 展示问题，回退到对应阶段修复 |
| 图片压缩失败 | review | 重新生成该图片或调整压缩参数 |
| 排版格式化异常 | review（wechat） | 检查 Markdown 语法，手动修正 |
| Chrome/MCP 连不上 | publishing（xhs） | 检查服务是否启动，或降级到手动发布 |
| 登录态失效 | publishing（xhs） | 引导用户重新登录 |
| 公众号 API 错误 | publishing（wechat） | 检查 AppID/Secret/IP白名单 |

### 自动降级

- **XHS 发布阶段**：MCP 不可用 → 自动降级到 CDP 脚本 → 再降级到生成手动发布手册
- **WeChat 发布阶段**：直接群发失败 → 降级到草稿箱模式

---

## 7. 手动修改状态文件的注意事项

### 什么时候需要手动改

- 需要强制跳过某个阶段
- 需要回退到更早的阶段重跑
- 状态文件损坏需要修复

### 修改原则

1. **备份先行**：修改前先复制一份 `state.json.bak`
2. **时间戳同步**：修改状态后更新 `metadata.updated_at`
3. **版本号递增**：重大结构变化时递增 `version`
4. **platform 一致性**：确保 `platform` 字段与 `stages` 数组中的阶段列表匹配（xhs 有 imaging，wechat 有 visuals）
5. **保持一致性**：
   - `current_stage` 必须与 stages 数组的实际状态匹配
   - 回退阶段时，后续阶段的状态必须重置为 `pending`
   - artifacts 路径必须真实存在或设为 null
6. **不要删除历史**：checkpoints 和 errors 只追加，不删除

### 常见手动操作示例

#### 回退到 writing 阶段重跑（XHS）

```diff
  "current_stage": "writing",
  "stages": [
    { "name": "mining", "status": "completed", ... },
    {
      "name": "writing",
-     "status": "completed",
+     "status": "in_progress",
      ...
    },
    {
      "name": "imaging",
-     "status": "completed",
+     "status": "pending",
      ...
    },
-   { "name": "review", "status": "completed", ... },
-   { "name": "publishing", "status": "completed", ... }
+   { "name": "review", "status": "pending", ... },
+   { "name": "publishing", "status": "pending", ... }
  ]
```

#### 强制跳过 visuals 阶段（WeChat）

```diff
  {
    "name": "visuals",
-   "status": "failed",
+   "status": "skipped",
    "completed_at": "2024-01-01T12:00:00Z",
    "errors": [
      { "message": "手动跳过：用户决定用已有图片" }
    ]
  }
```

---

## 8. 版本历史

| Schema 版本 | 日期 | 说明 |
|------------|------|------|
| 4.0.0 | 2026-07-17 | 双平台重构：新增 `platform` 字段，支持 xhs/wechat 双平台；pipeline_id 格式改为 `{platform}-{date}-{slug}-{rand}`；stages 数组根据 platform 动态初始化（xhs: imaging; wechat: visuals）；新增 `review` 硬闸门阶段（5 阶段流水线）；metadata.created_by 改为 `"sc-pipeline"`；新增 review 阶段输入输出契约；更新目录结构（WeChat 有 visuals/ 和 review/ 目录）；WeChat 发布直接传 .md 文件 |
| 3.0.0 | 2026-07-17 | 目录架构升级：`.super/xhs-{slug}/` → `.super/{project-title}/`，按阶段分子目录，新增 `project_title` 和 `output_dir` 字段，最终产物迁移到 `posts/{project-title}/`，状态文件重命名为 `state.json` |
| 1.0.0 | 2024-01-01 | 初始版本，支持四阶段流水线 |
