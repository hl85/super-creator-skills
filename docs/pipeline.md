# 内容创作飞轮

super-creator 的完整创作流程由 6 个阶段组成，形成一个数据驱动的闭环飞轮。`sc-pipeline` 串联全流程，支持微信公众号和小红书双平台。

```
sc-content-mining
    ↓ 选题清单
sc-writer
    ↓ draft.md
sc-format-markdown / [visual skills]
    ↓ formatted.md + images
sc-content-review  ← 硬闸门（Hard Gate）
    ↓ review-report.md（必须通过才能进入发布）
sc-publish-wechat / sc-publish-xhs / sc-pipeline
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

## Stage 2 — 写作：`sc-writer`

**选定选题后**，将选题内容和参考素材一起提供给 Claude：

> "从选题清单中选第 3 条，用 sc-writer 帮我生成微信公众号草稿"

**两阶段流程**：
1. Stage 1（大纲）：提炼核心论点、读者画像、文章结构
2. Stage 2（草稿）：按平台规范展开为完整 Markdown 草稿

---

## Stage 3 — 内容处理（按需组合）

| 需求 | Skill | 命令 |
|------|-------|------|
| 清理排版 / 加 frontmatter | `sc-format-markdown` | `./sc-run sc-format-markdown main article.md` |
| Markdown 转微信 HTML | `sc-convert-markdown-to-html` | `./sc-run sc-convert-markdown-to-html main article.md` |
| 生成封面图 | `sc-cover-image` | 对话调用 |
| 生成章节配图 | `sc-article-illustrator` + `sc-imagine` | 见下方注意事项 |
| 生成小红书图文 | `sc-xhs-images` | 对话调用 |
| 压缩图片 | `sc-compress-image` | `./sc-run sc-compress-image main image.png` |

> **注意：`sc-article-illustrator` 与 `sc-imagine` 的两步流程**
> 1. `./sc-run sc-article-illustrator build-batch --input article.md` → 生成 `output-dir/prompts/batch.json`
> 2. `./sc-run sc-imagine build-batch --batchfile output-dir/prompts/batch.json` → 生成所有配图

---

## Stage 4 — 发布前审查：`sc-content-review`（硬闸门）

> "用 sc-content-review 审查 article.md，目标平台是微信"

输出 `review-report.md`，包含合规/事实/链接三维度的 severity-tagged 问题列表。

**硬闸门规则**：
- **必须执行**：发布前必须经过 `sc-content-review` 审查
- **阻塞发布**：如果存在 `critical` 或 `high` 严重级别的问题，流程暂停，必须修复后重新审查
- **人工确认**：`medium` 和 `low` 级别问题可由用户确认后继续
- **双平台分别审查**：微信和小红书的审查标准不同，需分别指定目标平台

---

## Stage 5 — 发布

### 单平台发布

| 平台 | Skill | 发布方式 |
|------|-------|---------|
| 微信公众号 | `sc-publish-wechat` | API / CDP |
| 小红书 | `sc-publish-xhs` | MCP（优先）/ CDP / 手动 |

**微信公众号发布命令**：
```bash
./sc-run sc-publish-wechat wechat-article article.md
```

**小红书发布**：对话调用 `sc-publish-xhs`。

### 双平台流水线：`sc-pipeline`

串联内容挖掘 → 写文 → 生图 → 审查 → 发布的全链路流水线，支持微信公众号和小红书双平台：

```
内容源 → [挖掘] → [写文] → [生图] → [审查闸门] → [发布]
         sc-       sc-       sc-      sc-         sc-publish-
         content-  writer    xhs-     content-    wechat /
         mining             images   review      publish-xhs
```

**调用方式**：
> "跑一篇微信公众号文章，从我的博客文章里挖选题"
> "启动 pipeline，目标平台小红书，选择手动发布模式"
> "双平台发布：先生成公众号文章，再适配小红书"

**平台选择**：
- `--platform wechat`：仅微信公众号
- `--platform xhs`：仅小红书
- `--platform both`：双平台（先生成公众号版本，再适配为小红书版本）

**发布模式选择**：
- 手动发布（推荐）：生图完成后生成发布手册，人工手动发布，最安全
- 自动发布：用 MCP / CDP 自动化发布，有风控风险

**状态文件机制**：`state.json` 记录每步状态，支持断点续跑。详见 `skills/sc-pipeline/SKILL.md`。

---

## 视觉 Skill 选择指南

| 我需要… | 推荐 Skill |
|---------|-----------|
| 文章头部封面图（1 张）| `sc-cover-image` |
| 文章章节配图（多张，定位插入）| `sc-article-illustrator` + `sc-imagine` |
| 小红书可滑动图文系列（2–10 张）| `sc-xhs-images` |
| 任意图像生成（直接 prompt）| `sc-imagine` |
