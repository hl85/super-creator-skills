---
name: sc-pipeline
description: 通用内容生产流水线，支持小红书（xhs）和微信公众号（wechat）双平台。串联从挖掘到发布全链路，支持断点续跑、阶段回退、每步确认、发布前硬闸门（内容审核+图片压缩）。Use when user asks to "跑一篇小红书", "跑一篇公众号", "pipeline", "从挖掘到发布", "一键出内容", "继续上次的", "从状态文件恢复".
version: 4.0.0
---

# SC Pipeline: 双平台内容生产流水线

通用内容生产编排器，支持 **小红书（xhs）** 和 **微信公众号（wechat）** 双平台。挖掘 → 创作 → 视觉 → 审核 → 发布 全链路，支持任意内容源（课程纪要/博客文章/播客字幕/读书笔记等）。

## 参数说明

| 参数 | 缩写 | 值 | 默认 | 说明 |
|------|------|-----|------|------|
| `--platform` | `-p` | `xhs` \| `wechat` | `xhs` | 目标平台 |
| `--source` | `-s` | 文件路径 | — | 内容源文件（start 时必需） |
| `--stage` | — | 阶段名 | 自动检测 | resume 时指定恢复阶段 |

## Usage

All commands use `./sc-run sc-pipeline <command>`.

```bash
# 小红书（默认平台）
./sc-run sc-pipeline start --source article.md
./sc-run sc-pipeline start -p xhs --source article.md

# 微信公众号
./sc-run sc-pipeline start -p wechat --source article.md

# 续跑（自动检测最近一次 pipeline）
./sc-run sc-pipeline resume
./sc-run sc-pipeline resume --stage writing
```

## Intents

- **全链路生产**：内容挖掘 → 文案写作 → 视觉生成 → 审核 → 发布，一站式流水线（双平台）
- **断点续跑**：跨对话状态持久化，随时暂停/恢复
- **阶段回退**：可从任意已完成阶段重跑，后续自动重置
- **每步确认**：每个 Stage 结束后与用户确认，不跳步
- **质量闸门**：发布前硬闸门自动检查（内容审核 + 图片压缩 + 排版格式化），critical 问题阻塞发布

## 双平台阶段全景

### 小红书（xhs）— 5 阶段

| 阶段 | 一句话说明 | 对应 Skill |
|------|-----------|-----------|
| 1. mining | 从内容源提取选题，确认方向 | sc-content-mining |
| 2. writing | 生成小红书文案（大纲→终稿） | sc-writer -p xhs |
| 3. imaging | 生成 2-9 张信息图（封面+内容图） | sc-xhs-images |
| 4. review | **硬闸门**：内容审核 + 图片压缩 | sc-content-review + sc-compress-image |
| 5. publishing | 发布（MCP / CDP / 手动） | sc-publish-xhs / xiaohongshu-mcp |

### 微信公众号（wechat）— 5 阶段

| 阶段 | 一句话说明 | 对应 Skill |
|------|-----------|-----------|
| 1. mining | 从内容源提取选题，确认方向 | sc-content-mining |
| 2. writing | 生成公众号长文（大纲→终稿） | sc-writer -p wechat |
| 3. visuals | 封面图 + 文章配图 | sc-cover-image + sc-article-illustrator |
| 4. review | **硬闸门**：排版格式化 + 内容审核 + 图片压缩 | sc-format-markdown + sc-content-review + sc-compress-image |
| 5. publishing | 发布到公众号 | sc-publish-wechat |

**状态文件位置**：`.super/{project-title}/state.json`

## Progressive Disclosure

深入阅读按需要查阅：

- [references/state-management.md](references/state-management.md) - **状态文件完整 Schema + 状态转移图 + 错误恢复策略**
- [references/hard-gates.md](references/hard-gates.md) - **硬闸门机制详解（review 阶段）**
- [references/platforms/xhs.md](references/platforms/xhs.md) - **小红书平台 5 阶段详细操作指南**
- [references/platforms/wechat.md](references/platforms/wechat.md) - **微信公众号平台 5 阶段详细操作指南**
- [references/xhs-mcp-setup.md](references/xhs-mcp-setup.md) - **xiaohongshu-mcp 安装配置 + 三级降级策略详解**

## Error Handling

See [references/state-management.md](references/state-management.md) for state recovery and error handling strategies.
