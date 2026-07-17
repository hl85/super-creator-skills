---
name: xhs-pipeline
description: 小红书内容生产全链路流水线（内容挖掘 → 写作 → 生图 → 发布），支持任意内容源。串联 content-mining → writeflow → xhs-images → post-to-xhs 四个 skill，每步与用户确认。支持状态文件断点续跑，可从任意阶段恢复。Use when user asks to "跑一篇小红书", "XHS pipeline", "从挖掘到发布", "一键出小红书内容", "继续上次的小红书", "从状态文件恢复", or wants the full content production pipeline.
version: 3.0.0
---

# XHS Pipeline: 小红书内容生产流水线

挖掘 → 写文 → 生图 → 发布 全链路。支持任意内容源（课程纪要/博客文章/播客字幕/读书笔记等）。

## Usage

All commands use `./sc-run xhs-pipeline <script>`.

```bash
# 全新开始（从内容源到发布）
./sc-run xhs-pipeline start --source article.md

# 从状态文件继续
./sc-run xhs-pipeline resume

# 从指定阶段恢复
./sc-run xhs-pipeline resume --stage writing
```

## Intents

- **全链路生产**：内容挖掘 → 文案写作 → 图片生成 → 发布，一站式流水线
- **断点续跑**：跨对话状态持久化，随时暂停/恢复
- **阶段回退**：可从任意已完成阶段重跑，后续自动重置
- **每步确认**：每个 Stage 结束后与用户确认，不跳步

## 四阶段全景

| 阶段 | 一句话说明 | 对应 Skill |
|------|-----------|-----------|
| 1. 挖掘 | 从内容源提取选题，确认方向 | content-mining |
| 2. 写文 | 生成小红书文案（大纲→终稿） | writeflow |
| 3. 生图 | 生成 2-9 张信息图（封面+内容图） | xhs-images |
| 4. 发布 | 手动发布（推荐） / 自动发布 | post-to-xhs / xiaohongshu-mcp |

**状态文件位置**：`.super/{project-title}/state.json`

## Progressive Disclosure

深入阅读按需要查阅：

- [references/stage-guides.md](references/stage-guides.md) - **四阶段详细操作指南（步骤/Checkpoint/输入输出/FAQ）**
- [references/state-management.md](references/state-management.md) - **状态文件完整 Schema + 状态转移图 + 错误恢复策略**
- [references/mcp-setup.md](references/mcp-setup.md) - **xiaohongshu-mcp 安装配置 + 三级降级策略详解**

## Error Handling

See [references/state-management.md](references/state-management.md) for state recovery and error handling strategies.
