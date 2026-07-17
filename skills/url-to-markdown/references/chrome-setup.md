# Chrome 首次配置指南

url-to-markdown 通过 Chrome DevTools Protocol (CDP) 控制真实 Chrome 浏览器，实现网页内容抓取和 Markdown 转换。

---

## 第一步：了解 Chrome Profile 路径

所有 CDP skill 共用一个 Chrome Profile，路径因平台而异：

| 平台 | 路径 |
|------|------|
| macOS | `~/Library/Application Support/super-creator/chrome-profile` |
| Linux | `~/.config/super-creator/chrome-profile` |
| Windows | `%APPDATA%\super-creator\chrome-profile` |

可通过 `SC_CHROME_PROFILE_DIR` 环境变量覆盖。

---

## 第二步：首次启动 Chrome

首次运行 url-to-markdown 时，它会自动以调试模式启动 Chrome，使用 **远程调试端口 9222**。

如果遇到端口冲突：

```bash
# macOS/Linux：关闭占用 9222 端口的进程
lsof -ti:9222 | xargs kill -9

# 或关闭所有 Chrome 实例后重试
pkill -f "Google Chrome"
```

---

## 第三步：平台登录（按需）

url-to-markdown 本身不需要特定平台登录，但抓取需要登录的网站时（如 X、付费内容等），可以在 Chrome 中手动登录对应网站，登录状态会持久化到 Chrome Profile。

常见需要登录的场景：
- **X (Twitter)**：导航到 `https://x.com` 完成登录
- 其他需要登录的网站：在 Chrome 中手动登录一次即可

---

## 常见问题

| 问题 | 解决方法 |
|------|----------|
| `Chrome debug port not ready` | 关闭所有 Chrome 实例，重试 |
| `Port 9222 already in use` | `lsof -ti:9222 \| xargs kill -9` |
| 抓取内容不完整（需登录）| 在 Chrome 中手动登录目标网站后重试 |
| Chrome 未安装 | 下载 [Google Chrome](https://www.google.com/chrome/)，须使用完整版（非 Chromium）|
