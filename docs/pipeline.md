# 内容创作飞轮

super-creator 的完整创作流程由 8 个阶段组成，形成一个数据驱动的闭环飞轮。

```
idea-radar
    ↓ ideas.jsonl
writeflow
    ↓ draft.md
format-markdown / translate / [visual skills]
    ↓ formatted.md + images
content-review
    ↓ review-report.md
multi-publish / post-to-*
    ↓ 已发布内容
post-analytics
    ↓ 互动数据写回 ideas.jsonl
idea-radar（下一轮）
```

---

## Stage 1 — 发现想法：`idea-radar`

扫描 X 列表、RSS、GitHub、Exa，对内容想法评分去重，追加到 `ideas.jsonl`。

**调用方式**：在对话中告诉 Claude：
> "帮我用 idea-radar 扫描我的 X 列表，生成今天的想法报告"

**输出**：`ideas.jsonl`（每行一个评分想法，包含 `id`、`title`、`score`、`source` 字段）

---

## Stage 2 — 素材采集（可选）

在写作前，可用以下 skill 采集原始素材：

| 场景 | 命令 |
|------|------|
| 抓取文章/网页 | `./sc-run url-to-markdown main <url>` |
| 下载 YouTube 字幕 | `./sc-run youtube-transcript main <youtube-url>` |
| 保存 X 推文/线程 | `./sc-run x-to-markdown main <x-url>` |

---

## Stage 3 — 写作：`writeflow`

**从 `ideas.jsonl` 选取想法后**，将 idea 内容和采集到的素材一起提供给 Claude：

> "从 ideas.jsonl 中取第 3 条想法，结合 source.md 这份素材，用 writeflow 帮我生成微信公众号草稿"

**两阶段流程**：
1. Stage 1（大纲）：提炼核心论点、读者画像、文章结构
2. Stage 2（草稿）：按平台规范展开为完整 Markdown 草稿

---

## Stage 4 — 内容处理（按需组合）

| 需求 | Skill | 命令 |
|------|-------|------|
| 清理排版 / 加 frontmatter | `format-markdown` | `./sc-run format-markdown main article.md` |
| 翻译 | `translate` | `./sc-run translate main article.md --to en` |
| 生成封面图 | `cover-image` | 对话调用 |
| 生成章节配图 | `article-illustrator` + `imagine` | 见下方注意事项 |
| 生成信息图 | `infographic` | 对话调用 |
| 生成小红书图文 | `xiaohongshu-images` | 对话调用 |
| 生成推文 JSON | `markdown-to-thread` | 对话调用 |
| 压缩图片 | `compress-image` | `./sc-run compress-image main image.png` |

> **注意：`article-illustrator` 与 `imagine` 的两步流程**
> 1. `./sc-run article-illustrator build-batch --input article.md` → 生成 `output-dir/prompts/batch.json`
> 2. `./sc-run imagine build-batch --batchfile output-dir/prompts/batch.json` → 生成所有配图

---

## Stage 5 — 发布前审查：`content-review`

> "用 content-review 审查 article.md，目标平台是微信"

输出 `review-report.md`，包含合规/事实/链接三维度的 severity-tagged 问题列表。**建议在发布前始终执行。**

---

## Stage 6 — 发布

### 单平台发布

| 平台 | 命令 |
|------|------|
| 微信公众号 | `./sc-run post-to-wechat wechat-article article.md` |
| X（推文/线程）| `./sc-run post-to-x main --thread thread.json` |
| 微博 | `./sc-run post-to-weibo weibo-article article.md` |
| 小红书 | 对话调用 `post-to-xhs`（Beta）|

### 多平台一键分发

> "用 multi-publish 把 article.md 发到微信和 X，先草稿不要直接发"（Beta，对话调用）

### `markdown-to-thread` → `post-to-x` 交接

1. 对话调用 `markdown-to-thread`，输出 `thread.json`
2. `./sc-run post-to-x main --thread thread.json`

---

## Stage 7 — 数据回收：`post-analytics`

发布后，`post-analytics` 读取各平台互动数据（阅读量、点赞、转发）并将结果写回 `ideas.jsonl`，为下一轮 `idea-radar` 评分提供反馈信号。

> "用 post-analytics 抓取最近发布的文章数据，更新到 ideas.jsonl"

---

## 视觉 Skill 选择指南

| 我需要… | 推荐 Skill |
|---------|-----------|
| 文章头部封面图（1 张）| `cover-image` |
| 文章章节配图（多张，定位插入）| `article-illustrator` + `imagine` |
| 复杂数据/流程可视化（1 张）| `infographic` |
| 小红书可滑动图文系列（2–10 张）| `xiaohongshu-images` |
| 教育/趣味漫画 | `comic` |
| 演示文稿（可导出 PPTX）| `slide-deck` |
| 任意图像生成（直接 prompt）| `imagine` |

---

## X URL 转换 Skill 选择指南

| 我需要… | 推荐 Skill |
|---------|-----------|
| 干净文本提取（官方 Chrome CDP）| `url-to-markdown` |
| 需要下载媒体文件到本地 | `x-to-markdown`（需用户授权）|
