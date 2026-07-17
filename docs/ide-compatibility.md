# IDE 兼容性说明

super-creator-skills 设计为 IDE 中立的 AI Skill 集合，核心资产不依赖任何特定 AI IDE。

## 设计原则

1. **核心资产 IDE 中立**：SKILL.md（Markdown）、scripts/（TypeScript）、references/（Markdown）是纯文本文件，任何 AI IDE 都能读取和使用
2. **标准协议通信**：浏览器自动化使用 MCP（Model Context Protocol）标准协议，不依赖专有 API
3. **兼容层而非锁定**：`.claude-plugin/` 目录是 Claude Code 的插件注册格式，作为兼容层存在，不影响其他 IDE
4. **自动发现优先**：支持通过 `.agents/skills/` 目录自动扫描加载

## 各 IDE 支持情况

| IDE | Skill 加载方式 | MCP 浏览器 | 验证状态 |
|-----|---------------|-----------|---------|
| **TRAE** | 自动扫描 `.agents/skills/` | ✅ 内置 `integrated_browser` | ✅ 已验证 |
| **Claude Code** | `.claude-plugin/marketplace.json` 插件注册 | 需配置 `@anthropic/browser-use` 或 Playwright MCP | ✅ 已验证 |
| **Cursor** | 打开项目目录，AI 自动识别 `skills/` 下的 SKILL.md | 需配置 Playwright MCP（Cursor 最新版内置浏览器） | ✅ 基本可用 |
| **Codex (OpenAI)** | 读取 `AGENTS.md`，手动引用 skill 路径 | 需配置 MCP 浏览器 | ⚠️ 未完整验证 |
| **Windsurf** | 打开项目目录，AI 自动识别 | 需配置 MCP 浏览器 | ⚠️ 未验证 |
| **Cline / Roo Code** | VS Code 扩展，读取工作区文件 | 需配置 MCP 浏览器 | ⚠️ 未验证 |

## 为什么有 `.claude-plugin/` 目录？

`.claude-plugin/marketplace.json` 是 Claude Code 的插件注册格式，作用如下：

- **仅用于 Claude Code**：Claude Code 通过 `/plugin marketplace add` 命令安装插件时需要此文件
- **单一真相源**：marketplace.json 记录了所有 skill 的列表和版本号，供版本同步脚本使用
- **不影响其他 IDE**：TRAE 通过 `.agents/skills/` 自动扫描，Cursor/Codex 通过文件系统直接读取，都不需要此文件
- **不会删除**：作为兼容层保留，方便 Claude Code 用户安装

## 为什么文件名是 `CLAUDE.md`？

`CLAUDE.md` 是 Claude Code 的项目级指令文件约定（类似 `.gitignore` 之于 Git）。但：

- TRAE 同时读取 `CLAUDE.md` 和 `AGENTS.md`
- Codex 读取 `AGENTS.md`
- 文件内容已去品牌化，面向所有 AI 编码助手
- 保留 `CLAUDE.md` 文件名是为了兼容 Claude Code 的自动加载机制

## 去品牌化规范

为了保持 IDE 中立，文档中遵循以下规范：

| 不要写 | 应该写 | 说明 |
|--------|--------|------|
| "告诉 Claude..." | "告诉 AI 助手..." | AI 代称去品牌化 |
| "Claude 对话引导" | "对话引导" | 功能描述不绑定品牌 |
| "在 Claude 中安装" | "在 AI IDE 中安装" | 安装说明面向所有 IDE |

允许保留品牌名的场景：
- 指称具体产品（如 "Claude Desktop 的配置文件路径是..."）
- 指称特定 IDE 的功能（如 "Claude Code 的 `/plugin` 命令"）
- 外部链接和文档引用

## MCP 浏览器配置

免费生图（sc-web-ai）依赖 MCP 浏览器工具。各 IDE 配置方式：

### TRAE（已内置）
无需配置，`integrated_browser` MCP 已内置可用。

### Cursor
在 Cursor 设置 → Features → MCP 中添加 Playwright MCP：
```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest"]
    }
  }
}
```
配置文件路径：`~/.cursor/mcp.json`

### Claude Desktop
在 Claude Desktop 设置中添加 MCP 服务器：
```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest"]
    }
  }
}
```
配置文件路径：`~/Library/Application Support/Claude/claude_desktop_config.json`

### 其他 IDE
任何支持 MCP 协议的 IDE 都可以通过添加 `@playwright/mcp` 来启用浏览器自动化能力。

## 添加新 IDE 支持

如果你在其他 AI IDE 中使用 super-creator-skills，需要确认：

1. **Skill 加载**：IDE 能读取工作区中的 Markdown 文件（SKILL.md）
2. **MCP 支持**：IDE 支持 MCP 协议，可以配置 `@playwright/mcp` 或内置浏览器
3. **TypeScript 运行**：scripts/ 中的脚本需要 Bun 或 Node.js 运行（大多数功能是纯 prompt 驱动，不需要运行脚本）

满足以上三点即可使用。欢迎提交 PR 补充新 IDE 的使用说明。
