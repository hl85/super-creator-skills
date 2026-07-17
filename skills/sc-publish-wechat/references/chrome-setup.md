# Chrome 首次配置指南

sc-publish-wechat 的 Browser 模式通过 Chrome DevTools Protocol (CDP) 控制真实 Chrome 浏览器，实现微信公众号自动化发布。

---

## 第一步：了解 Chrome Profile 路径

所有 CDP skill 共用一个 Chrome Profile，路径因平台而异：

| 平台 | 路径 |
|------|------|
| macOS | `~/Library/Application Support/super-creator/chrome-profile` |
| Linux | `~/.config/super-creator/chrome-profile` |
| Windows | `%APPDATA%\super-creator\chrome-profile` |

可通过 `SC_CHROME_PROFILE_DIR` 环境变量覆盖，或在 EXTEND.md 中设置 `CHROME_PROFILE_DIR`。

---

## 第二步：首次启动 Chrome

首次运行 Browser 模式时，它会自动以调试模式启动 Chrome，使用 **远程调试端口 9222**。

如果遇到端口冲突：

```bash
# macOS/Linux：关闭占用 9222 端口的进程
lsof -ti:9222 | xargs kill -9

# 或关闭所有 Chrome 实例后重试
pkill -f "Google Chrome"
```

---

## 第三步：登录微信公众号

1. 导航到 `https://mp.weixin.qq.com`
2. 使用微信 App 扫码登录
3. 登录持久化后无需重复扫码（直到会话过期）

---

## 常见问题

| 问题 | 解决方法 |
|------|----------|
| `Chrome debug port not ready` | 关闭所有 Chrome 实例，重试 |
| `Session expired` | 重新运行 skill，它会提示重新登录 |
| `Port 9222 already in use` | `lsof -ti:9222 \| xargs kill -9` |
| Chrome 未安装 | 下载 [Google Chrome](https://www.google.com/chrome/)，须使用完整版（非 Chromium）|
