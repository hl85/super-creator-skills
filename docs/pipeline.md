# 内容创作飞轮

super-creator 的完整创作流程由 6 个阶段组成，形成一个数据驱动的闭环飞轮。

```
sc-content-mining
    ↓ 选题清单
sc-writeflow
    ↓ draft.md
sc-format-markdown / [visual skills]
    ↓ formatted.md + images
sc-content-review
    ↓ review-report.md
sc-multi-publish / sc-post-to-*
    ↓ 已发布内容
sc-content-mining（下一轮，基于发布效果迭代选题）
```

---

## Stage 1 — 选题挖掘：`sc-content-mining`

从任意内容源提取"认知错位"模式，生成选题清单和呈现形式建议。支持课程纪要、博客、播客字幕等多种输入。

**调用方式**：在对话中告诉 Claude：
> "用 sc-content-mining 从这篇博客文章里挖 5 个选题"

**输出**：结构化选题清单（包含标题、核心论点、呈现形式建议、受众画像）

> **详解**：详见 `skills/sc-content-mining/SKILL.md`。

---

## Stage 2 — 写作：`sc-writeflow`

**选定选题后**，将选题内容和参考素材一起提供给 Claude：

> "从选题清单中选第 3 条，用 sc-writeflow 帮我生成微信公众号草稿"

**两阶段流程**：
1. Stage 1（大纲）：提炼核心论点、读者画像、文章结构
2. Stage 2（草稿）：按平台规范展开为完整 Markdown 草稿

---

## Stage 3 — 内容处理（按需组合）

| 需求 | Skill | 命令 |
|------|-------|------|
| 清理排版 / 加 frontmatter | `sc-format-markdown` | `./sc-run sc-format-markdown main article.md` |
| 生成封面图 | `sc-cover-image` | 对话调用 |
| 生成章节配图 | `sc-article-illustrator` + `sc-imagine` | 见下方注意事项 |
| 生成信息图 | `sc-infographic` | 对话调用 |
| 生成小红书图文 | `sc-xhs-images` | 对话调用 |
| 生成推文 JSON | `sc-markdown-to-thread` | 对话调用 |
| 压缩图片 | `sc-compress-image` | `./sc-run sc-compress-image main image.png` |

> **注意：`sc-article-illustrator` 与 `sc-imagine` 的两步流程**
> 1. `./sc-run sc-article-illustrator build-batch --input article.md` → 生成 `output-dir/prompts/batch.json`
> 2. `./sc-run sc-imagine build-batch --batchfile output-dir/prompts/batch.json` → 生成所有配图

---

## Stage 4 — 发布前审查：`sc-content-review`

> "用 sc-content-review 审查 article.md，目标平台是微信"

输出 `review-report.md`，包含合规/事实/链接三维度的 severity-tagged 问题列表。**建议在发布前始终执行。**

---

## Stage 5 — 发布

### 单平台发布

| 平台 | 命令 | 发布方式 |
|------|------|---------|
| 微信公众号 | `./sc-run sc-post-to-wechat wechat-article article.md` | API / CDP |
| X（推文/线程）| `./sc-run sc-post-to-x x-api --thread thread.json` | API v2（推荐）/ CDP |
| 微博 | `./sc-run sc-post-to-weibo weibo-article article.md` | CDP |
| 小红书 | 对话调用 `sc-post-to-xhs` | MCP（优先）/ CDP / 手动 |

### 小红书完整流水线：`sc-xhs-pipeline`

串联内容挖掘 → 写文 → 生图 → 发布的全链路流水线：

```
内容源 → [挖掘] → [写文] → [生图] → [发布] → 小红书
         sc-       sc-       sc-      sc-
         content-  writeflow xhs-     post-to-
         mining             images   xhs
```

**调用方式**：
> "跑一篇小红书，从我的博客文章里挖选题"
> "启动 xhs pipeline，选择手动发布模式"

**发布模式选择**：
- 手动发布（推荐）：生图完成后生成发布手册，人工手动发布，最安全
- 自动发布：用 MCP / CDP 自动化发布，有风控风险

**状态文件机制**：`state.json` 记录每步状态，支持断点续跑。详见 `skills/sc-xhs-pipeline/SKILL.md`。

### 多平台一键分发

> "用 sc-multi-publish 把 article.md 发到微信和 X，先草稿不要直接发"（Beta，对话调用）

### `sc-markdown-to-thread` → `sc-post-to-x` 交接

1. 对话调用 `sc-markdown-to-thread`，输出 `thread.json`
2. `./sc-run sc-post-to-x x-api --thread thread.json`

---

## 视觉 Skill 选择指南

| 我需要… | 推荐 Skill |
|---------|-----------|
| 文章头部封面图（1 张）| `sc-cover-image` |
| 文章章节配图（多张，定位插入）| `sc-article-illustrator` + `sc-imagine` |
| 复杂数据/流程可视化（1 张）| `sc-infographic` |
| 小红书可滑动图文系列（2–10 张）| `sc-xhs-images` |
| 教育/趣味漫画 | `sc-comic` |
| 演示文稿（可导出 PPTX）| `sc-slide-deck` |
| 任意图像生成（直接 prompt）| `sc-imagine` |
