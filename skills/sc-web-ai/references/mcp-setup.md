# MCP 浏览器工具安装配置指南

## 快速决策

```
如果 IDE 已有 integrated_browser？→ 直接用，不需要任何安装（TRAE/Cursor 等主流 IDE 都内置了）
如果没有？→ 安装 @playwright/mcp（微软官方）
都不行？→ 最后才考虑自己写代码
```

---

## 方式 1：IDE 内置浏览器（推荐，零配置）

**支持的 IDE：**
- TRAE（当前你正在使用的）✅ 已验证可用
- Cursor（最新版本）
- 其他基于 Claude/Codeium 的 AI IDE

**验证方法：**
直接尝试调用 `browser_tabs` 工具。如果工具存在并返回标签页列表，说明已经内置可用。

**使用方式：**
- 直接在内置浏览器侧边栏打开 Gemini/ChatGPT 并登录
- AI 可以直接检测并操作已打开的标签页
- 不需要任何额外配置

---

## 方式 2：安装 @playwright/mcp（备选方案）

如果 IDE 没有内置浏览器工具，安装微软官方的 Playwright MCP。

### 自动安装（推荐）

在 IDE 的 MCP 设置界面搜索 `@playwright/mcp`，点击"安装"或"添加"即可。

### 手动配置

在 MCP 配置文件中添加：

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

### 配置连接到用户本地 Chrome（可选，复用登录态）

如果想复用本地 Chrome 的登录状态、代理设置、扩展程序等：

**macOS:**
```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": [
        "@playwright/mcp@latest",
        "--browser", "chrome",
        "--channel", "chrome"
      ]
    }
  }
}
```

> 注意：使用用户数据目录时，需要先关闭所有 Chrome 窗口，否则会启动失败。建议直接使用内置浏览器，不需要这么麻烦。

---

## 配置文件位置

### TRAE
MCP 配置通常在：
- macOS: `~/Library/Application Support/TRAE/mcp.json`
- 或在 TRAE 设置 → MCP 中图形化配置

### Cursor
- 设置 → Features → MCP
- 或 `~/.cursor/mcp.json`

### Claude Desktop
- `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS)
- `%APPDATA%\Claude\claude_desktop_config.json` (Windows)

---

## 验证安装

配置完成后，重启 IDE，检查是否有以下工具可用：
- browser_tabs
- browser_navigate
- browser_snapshot
- browser_click
- browser_type

如果这些工具都存在，说明配置成功。

---

## 代理配置（国内用户）

如果你需要代理才能访问 Gemini/ChatGPT：

### 方式 1：系统全局代理（推荐）
- 开启系统代理
- 内置浏览器会自动使用系统代理设置
- 确保 Chrome 能正常访问 Gemini/ChatGPT 即可

### 方式 2：Playwright MCP 启动时指定代理
```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": [
        "@playwright/mcp@latest",
        "--proxy-server", "http://127.0.0.1:7890"
      ]
    }
  }
}
```
将 `http://127.0.0.1:7890` 替换为你的代理地址。

---

## 不推荐的方案

| 方案 | 为什么不推荐 |
|------|-------------|
| Puppeteer + 自己写 CDP | 维护成本高，和 sc-gemini-web 问题一样 |
| 第三方反向工程 Gemini/ChatGPT MCP | 大多不稳定，API 变更就失效 |
| Selenium | 老旧，检测率高，需要配驱动 |
| 直接调用 Web 私有 API | 就是我们刚删掉的 sc-gemini-web 方案 |
