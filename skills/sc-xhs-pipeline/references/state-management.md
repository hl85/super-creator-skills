# XHS Pipeline 状态管理机制

状态文件是 XHS Pipeline 的核心记忆机制，确保流水线可中断、可续跑、可回溯。

---

## 1. 状态文件完整 Schema

### 文件位置

```
.super/{project-title}/state.json
```

所有路径均为**相对于项目根目录**的相对路径，保证可移植。

### 目录结构总览

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
├── images/                  # 视觉生成阶段
│   ├── prompts/
│   ├── 01-cover.png
│   └── ...
└── publish/                 # 发布阶段
    └── PUBLISH-MANUAL.md

posts/{project-title}/       # 最终交付物（pipeline 完成后迁移）
├── content.md
├── caption.txt
└── images/
    ├── 01-cover.png
    └── ...
```

---

### 通用简化示例（知识付费场景）

```json
{
  "pipeline_id": "xhs-20240101-ai-efficiency-tips-abc123",
  "project_title": "AI 效率工具入门",
  "topic_slug": "ai-efficiency-tips",
  "current_stage": "mining",
  "publish_mode": "manual",
  "version": "3.0.0",
  "metadata": {
    "created_at": "2024-01-01T10:00:00Z",
    "updated_at": "2024-01-01T11:30:00Z",
    "schema_version": "3.0.0",
    "created_by": "sc-xhs-pipeline"
  },
  "stages": [
    {
      "name": "mining",
      "status": "completed",
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
    }
  ],
  "checkpoints": [
    {
      "stage": "mining",
      "confirmed_at": "2024-01-01T10:50:00Z",
      "confirmed_by": "user",
      "decision": "approved",
      "notes": "选题OK"
    }
  ],
  "artifacts": {
    "mining_output": ".super/AI 效率工具入门/mining/topics.md"
  }
}
```

---

### 📌 完整示例（面试辅导场景）

以下为面试辅导场景的完整状态文件示例：

```json
{
  "pipeline_id": "xhs-20240101-interview-potential-abc123",
  "project_title": "面试其实不是考技术",
  "topic_slug": "interview-potential-over-tech",
  "current_stage": "mining",
  "publish_mode": "manual",
  "version": "3.0.0",
  "metadata": {
    "created_at": "2024-01-01T10:00:00Z",
    "updated_at": "2024-01-01T11:30:00Z",
    "schema_version": "3.0.0",
    "created_by": "xhs-pipeline"
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
          "audience": "求职新人",
          "tone": "认知颠覆",
          "scope": "最近3篇纪要",
          "core_logic": "面试不是考技术是赌潜力"
        }
      },
      "outputs": {
        "mining_output": ".super/面试其实不是考技术/mining/topics.md",
        "selected_topic_index": 2
      },
      "errors": []
    },
    {
      "name": "writing",
      "status": "in_progress",
      "started_at": "2024-01-01T11:00:00Z",
      "completed_at": null,
      "inputs": {
        "source": ".super/面试其实不是考技术/mining/topics.md",
        "topic_index": 2,
        "platform": "xhs"
      },
      "outputs": {
        "outline": null,
        "content": null,
        "caption": null
      },
      "errors": []
    },
    {
      "name": "imaging",
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
      "confirmed_at": "2024-01-01T10:50:00Z",
      "confirmed_by": "user",
      "decision": "approved",
      "notes": "选题方向OK，选第3个"
    }
  ],
  "artifacts": {
    "mining_output": ".super/面试其实不是考技术/mining/topics.md",
    "outline": null,
    "content": null,
    "caption": null,
    "images": [],
    "publish_manual": null
  },
  "output_dir": "posts/面试其实不是考技术/"
}
```

### 字段说明

#### 顶层字段

| 字段 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `pipeline_id` | string | ✅ | 唯一标识，格式 `xhs-{日期}-{topic-slug}-{短随机串}` |
| `project_title` | string | ✅ | 项目名（中文），用于目录命名和展示 |
| `topic_slug` | string | ✅ | 主题 slug（英文 kebab-case），用于 ID 生成 |
| `current_stage` | string | ✅ | 当前阶段，见「阶段定义」 |
| `publish_mode` | string | ✅ | 发布模式：`manual`（手动发布，推荐）/ `auto`（自动发布，有风控风险） |
| `version` | string | ✅ | 状态文件语义版本 |
| `output_dir` | string | ✅ | 最终产物输出目录，默认 `posts/{project-title}/` |
| `metadata` | object | ✅ | 元数据 |
| `stages` | array | ✅ | 各阶段状态数组 |
| `checkpoints` | array | ✅ | 用户确认记录 |
| `artifacts` | object | ✅ | 所有产出物路径索引 |

#### 阶段状态 (status)

| 状态 | 说明 |
|------|------|
| `pending` | 待开始 |
| `in_progress` | 进行中 |
| `completed` | 已完成（产出已就绪，待用户确认） |
| `failed` | 失败，有错误记录 |
| `skipped` | 已跳过 |

#### 阶段定义 (name)

| 阶段名 | 说明 | 对应目录 | 对应 Skill |
|--------|------|---------|-----------|
| `mining` | 内容挖掘 | `mining/` | sc-content-mining |
| `writing` | 文案撰写 | `draft/` | sc-writeflow |
| `imaging` | 信息图生成 | `images/` | sc-xhs-images |
| `publishing` | 发布 | `publish/` | sc-post-to-xhs / xiaohongshu-mcp |

> 注：没有 `done` 阶段。当 `publishing` 阶段状态为 `completed` 且有对应 checkpoint 时，表示全流程完成。最终产物会复制到 `posts/{project-title}/`。

---

## 2. 各阶段输入输出契约

### Stage 1: mining（内容挖掘）

**Inputs:**
```json
{
  "brainstorm": {
    "platform": "xiaohongshu",
    "audience": "目标受众（如：职场白领 / 宝妈 / 学生 / 创业者）",
    "tone": "内容调性（如：干货实用 / 认知颠覆 / 轻松幽默 / 治愈温暖）",
    "scope": "内容源范围（如：全部文件 / 最近N篇 / 指定目录）",
    "core_logic": "核心理念一句话"
  }
}
```

> 📌 **示例：面试辅导场景**
> - `audience`: 求职新人 | 3-5年经验 | 前端/后端/全栈
> - `tone`: 认知颠覆 | 避坑指南 | 实战干货 | 故事共鸣
> - `scope`: 全部纪要 | 最近N篇 | 特定学员

**Outputs:**
```json
{
  "mining_output": ".super/{project-title}/mining/topics.md",
  "selected_topic_index": 2
}
```

**Artifacts:**
- `mining_output`: 挖掘结果 Markdown 文件（选题清单）

---

### Stage 2: writing（文案撰写）

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

**Artifacts:**
- `outline`: 大纲文件
- `content`: 终稿 Markdown
- `caption`: 提取的纯正文

---

### Stage 3: imaging（信息图生成）

**Inputs:**
```json
{
  "content_file": ".super/{project-title}/draft/content.md",
  "style": "notion | bold | cute | fresh | ...",
  "layout": "dense | flow | list | balanced | ...",
  "preset": "knowledge-card | ..."
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

**Artifacts:**
- `images`: 生成的图片路径数组（按顺序，第1张为封面）

---

### Stage 4: publishing（发布）

**Inputs:**
```json
{
  "title": "笔记标题",
  "caption_file": ".super/{project-title}/draft/caption.txt",
  "images": [".super/{project-title}/images/01-cover.png", "..."],
  "tags": ["标签1", "标签2", "标签3"],
  "method": "mcp | cdp | manual",
  "publish_mode": "preview | publish"
}
```

> 📌 **示例：面试辅导场景**
> - `tags`: ["面试", "求职", "程序员", "职场"]

**Outputs:**
```json
{
  "published": true,
  "post_url": "https://www.xiaohongshu.com/discovery/item/...",
  "method_used": "cdp",
  "publish_manual": ".super/{project-title}/publish/PUBLISH-MANUAL.md"
}
```

**Artifacts:**
- `publish_manual`: 手动发布手册（fallback 时生成）

---

### 最终产物迁移

Pipeline 全流程完成（publishing 阶段 confirmed）后，将最终产物从 `.super/` 复制到 `posts/`：

```
.super/{project-title}/draft/content.md    → posts/{project-title}/content.md
.super/{project-title}/draft/caption.txt   → posts/{project-title}/caption.txt
.super/{project-title}/images/*.png        → posts/{project-title}/images/
```

- 是**复制**不是移动——过程产物保留在 `.super/` 中供回溯
- 只复制最终版文件，过程文件（prompts、state.json 等）不复制

---

### 不同场景下的字段适配说明

| 场景 | audience 示例 | tone 示例 | scope 示例 | tags 示例 | 内容源类型 |
|------|--------------|-----------|------------|-----------|-----------|
| **面试辅导** | 求职新人 / 3-5年经验 / 转行选手 | 认知颠覆 / 避坑指南 / 实战干货 | 最近3篇纪要 / 特定学员 / 全部纪要 | 面试、求职、程序员、职场 | 面试辅导 1v1 纪要 |
| **知识付费** | 职场白领 / 宝妈 / 学生党 | 干货实用 / 效率提升 / 认知升级 | 第1-3章 / 全部课程文稿 / 指定模块 | AI、效率工具、知识付费、自我提升 | 课程文稿 / 专栏文章 |
| **产品营销** | 目标用户画像 / 决策层 / 一线从业者 | 种草推荐 / 痛点共鸣 / 数据说话 | 产品文档 / 用户反馈 / 竞品分析 | 产品推荐、好物分享、效率神器 | 产品文档 / 用户研究报告 |
| **个人IP** | 同频小伙伴 / 粉丝群体 / 行业同仁 | 真诚分享 / 故事共鸣 / 观点输出 | 全部笔记 / 特定主题 / 年度复盘 | 个人成长、生活记录、职场感悟 | 读书笔记 / 个人随笔 / 播客字幕 |

> 💡 **使用建议**：根据具体场景灵活调整字段，以上为常见场景的参考值，不是固定枚举。

---

## 3. 状态转移图

### 合法的阶段切换路径

```
                    ┌─────────────┐
                    │   mining    │
                    │ (pending)   │
                    └──────┬──────┘
                           │
                        开始
                           ▼
                    ┌─────────────┐
                    │   mining    │
                    │(in_progress)│
                    └──────┬──────┘
                           │
                  ┌────────┴────────┐
                  │                 │
                成功               失败
                  ▼                 ▼
            ┌──────────┐     ┌──────────┐
            │  mining  │     │  mining  │
            │(completed)│    │ (failed) │
            └─────┬────┘     └────┬─────┘
                  │               │
            用户确认           重试/跳过
                  ▼               ▼
            ┌──────────┐     ┌──────────┐
            │ checkpoint│     │ 回退到  │
            │ (mining) │     │  mining │
            └─────┬────┘     └──────────┘
                  │
             进入下一阶段
                  ▼
            ┌──────────────┐
            │   writing    │
            │  (pending)   │
            └──────┬───────┘
                   │
                  ...
          (同 mining 的状态机模式)
                   │
                   ▼
            ┌──────────────┐
            │   imaging    │
            └──────┬───────┘
                   │
                  ...
                   │
                   ▼
            ┌──────────────┐
            │  publishing  │
            └──────┬───────┘
                   │
                  ...
                   │
                   ▼
            ✅ 全流程完成
      (publishing completed + checkpoint)
      → 产物复制到 posts/{project-title}/
```

### 状态转移规则表

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
| writing | completed | 用户确认通过 | imaging | pending |
| writing | completed | 用户要求修改 | writing | in_progress |
| writing | failed | 重试 | writing | in_progress |
| writing | failed | 跳过 | imaging | pending |
| imaging | pending | 开始生图 | imaging | in_progress |
| imaging | in_progress | 生图完成 | imaging | completed |
| imaging | in_progress | 生图失败 | imaging | failed |
| imaging | completed | 用户确认通过 | publishing | pending |
| imaging | completed | 用户要求修改 | imaging | in_progress |
| imaging | failed | 重试 | imaging | in_progress |
| imaging | failed | 跳过 | publishing | pending |
| publishing | pending | 开始发布 | publishing | in_progress |
| publishing | in_progress | 发布完成 | publishing | completed |
| publishing | in_progress | 发布失败 | publishing | failed |
| publishing | completed | 用户确认发布成功 → 迁移产物到 posts/ | — | — (done) |
| publishing | failed | 重试 | publishing | in_progress |

### 回退规则

支持从**任意已完成的阶段**重新开始，后续阶段状态重置为 `pending`：

- 例：从 writing 阶段重跑 → imaging 和 publishing 重置为 pending
- 例：从 mining 阶段重跑 → writing、imaging、publishing 全部重置为 pending

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

---

## 5. 断点续跑机制

### 如何续跑

当用户说「从状态文件继续」或「继续上次的 pipeline」时：

1. 查找 `.super/*/state.json`（glob 匹配所有项目）
2. 读取 `current_stage` 和各阶段状态
3. 定位到**最近一个没有 checkpoint 的 completed 阶段**，或当前 in_progress 的阶段
4. 从该位置继续执行

### 续跑场景

| 场景 | 判断依据 | 续跑行为 |
|------|---------|---------|
| 挖掘完成，等确认 | mining=completed，无 mining checkpoint | 展示挖掘结果，请求确认 |
| 写文进行中，中断了 | writing=in_progress | 重新开始 writing 阶段 |
| 写文完成，等确认 | writing=completed，无 writing checkpoint | 展示文案，请求确认 |
| 生图失败了 | imaging=failed，有错误记录 | 询问是否重试 |
| 发布完成 | publishing=completed，有 checkpoint | 告知已完成，展示结果和 posts/ 路径 |

### 续跑命令示例

```
# 自动找到最近的 pipeline 并继续
"继续上次的小红书 pipeline"

# 指定项目名继续
"从「面试其实不是考技术」的状态继续"

# 查看当前状态
"看看 xhs pipeline 现在到哪一步了"
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
| 图片生成超时 | imaging | 单张图重试，或减少图片数量 |
| Chrome 连不上 | publishing | 检查 Chrome 是否启动，或降级到手动发布 |
| 登录态失效 | publishing | 引导用户重新登录 |

### 自动降级

- **发布阶段**：MCP 不可用 → 自动降级到 CDP 脚本 → 再降级到生成手动发布手册

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
4. **保持一致性**：
   - `current_stage` 必须与 stages 数组的实际状态匹配
   - 回退阶段时，后续阶段的状态必须重置为 `pending`
   - artifacts 路径必须真实存在或设为 null
5. **不要删除历史**：checkpoints 和 errors 只追加，不删除

### 常见手动操作示例

#### 回退到 mining 阶段重跑

```diff
  "current_stage": "mining",
  "stages": [
    {
      "name": "mining",
-     "status": "completed",
+     "status": "in_progress",
      "started_at": "2024-01-01T10:00:00Z",
-     "completed_at": "2024-01-01T10:45:00Z",
+     "completed_at": null,
      ...
    },
    {
      "name": "writing",
-     "status": "completed",
+     "status": "pending",
-     "started_at": "...",
+     "started_at": null,
-     "completed_at": "...",
+     "completed_at": null,
      ...
    },
    // imaging 和 publishing 同理重置
  ],
+ "checkpoints": [
+   // 保留历史 checkpoint，不要删
+   { "stage": "mining", ... },
+   { "stage": "writing", ... }
+ ]
```

#### 强制跳过 imaging 阶段

```diff
  {
    "name": "imaging",
-   "status": "failed",
+   "status": "skipped",
    "started_at": "...",
+   "completed_at": "2024-01-01T12:00:00Z",
+   "errors": [
+     { "message": "手动跳过：用户决定用已有图片" }
+   ]
  }
```

---

## 8. 版本历史

| Schema 版本 | 日期 | 说明 |
|------------|------|------|
| 3.0.0 | 2026-07-17 | 目录架构升级：`.super/xhs-{slug}/` → `.super/{project-title}/`，按阶段分子目录（mining/draft/images/publish），新增 `project_title` 和 `output_dir` 字段，最终产物迁移到 `posts/{project-title}/`，状态文件重命名为 `state.json` |
| 1.0.0 | 2024-01-01 | 初始版本，支持四阶段流水线 |
