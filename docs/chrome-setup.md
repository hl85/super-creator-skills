# Chrome 首次配置指南

super-creator 的多个 skill 通过 Chrome DevTools Protocol (CDP) 控制真实 Chrome 浏览器，实现自动化发布和内容抓取。本文覆盖所有依赖 Chrome 的 skill 的共同配置步骤。

**依赖 Chrome 的 skill：** `sc-publish-wechat`、`sc-publish-xhs`、`sc-web-ai`

---

## 第一步：了解 Chrome Profile 路径

所有 skill 共用一个 Chrome Profile，路径因平台而异：

| 平台 | 路径 |
|------|------|
| macOS | `~/Library/Application Support/super-creator/chrome-profile` |
| Linux | `~/.config/super-creator/chrome-profile` |
| Windows | `%APPDATA%\super-creator\chrome-profile` |

可通过 `SC_CHROME_PROFILE_DIR` 环境变量覆盖，或在各 skill 的 EXTEND.md 中设置 `CHROME_PROFILE_DIR`。

---

## 第二步：首次启动 Chrome

首次运行任何依赖 CDP 的 skill 时，它会自动以调试模式启动 Chrome：

```bash
# 手动验证 Chrome 能正常启动（可选）
./sc-run sc-publish-wechat wechat-article --check
```

Chrome 会以 **远程调试端口 9222** 启动。如果遇到端口冲突：

```bash
# macOS/Linux：关闭占用 9222 端口的进程
lsof -ti:9222 | xargs kill -9

# 或关闭所有 Chrome 实例后重试
pkill -f "Google Chrome"
```

---

## 第三步：登录各平台

每个发布平台需要单独登录一次，登录状态会持久化到 Chrome Profile。

### 微信公众号（Browser 模式）
1. 导航到 `https://mp.weixin.qq.com`
2. 使用微信 App 扫码登录
3. 登录持久化后无需重复扫码（直到会话过期）

### 小红书
1. 导航到 `https://www.xiaohongshu.com`
2. 使用小红书 App 扫码登录

### Gemini / ChatGPT（用于免费生图）
1. 在 IDE 内置浏览器中导航到 `https://gemini.google.com` 或 `https://chatgpt.com`
2. 使用对应账号完成登录
3. 保持标签页打开即可（无需通过 CDP 控制）

---

## 第四步：macOS 权限（仅限 macOS）

部分 skill（尤其是发布类 skill）需要粘贴图片，需要 Accessibility 权限：

1. **系统偏好设置** → **隐私与安全性** → **辅助功能**
2. 将你的终端应用（Terminal / iTerm2 / Warp 等）加入允许列表

---

## 常见问题

| 问题 | 解决方法 |
|------|----------|
| `Chrome debug port not ready` | 关闭所有 Chrome 实例，重试 |
| `Session expired` | 重新运行 skill，它会提示重新登录 |
| `Port 9222 already in use` | `lsof -ti:9222 \| xargs kill -9` |
| 图片粘贴失败（macOS）| 检查 Accessibility 权限 |
| Chrome 未安装 | 下载 [Google Chrome](https://www.google.com/chrome/)，须使用完整版（非 Chromium）|

---

## 多 Profile 配置

如果需要为不同项目使用不同的登录状态（如多个公众号或小红书账号），可以通过环境变量切换：

```bash
SC_CHROME_PROFILE_DIR=~/.config/super-creator/profile-work ./sc-run sc-publish-wechat wechat-article article.md
SC_CHROME_PROFILE_DIR=~/.config/super-creator/profile-personal ./sc-run sc-publish-xhs
```
