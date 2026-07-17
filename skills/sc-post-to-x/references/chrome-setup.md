# Chrome 首次配置指南

sc-post-to-x 的 Browser CDP 模式通过 Chrome DevTools Protocol 控制真实 Chrome 浏览器，实现 X (Twitter) 自动化发布。

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

首次运行 Browser 模式时，它会自动以调试模式启动 Chrome，使用 **远程调试端口 9222**。

```bash
# 手动验证 Chrome 能正常启动（可选）
./sc-run sc-post-to-x x-browser --check
```

如果遇到端口冲突：

```bash
# macOS/Linux：关闭占用 9222 端口的进程
lsof -ti:9222 | xargs kill -9

# 或关闭所有 Chrome 实例后重试
pkill -f "Google Chrome"
```

---

## 第三步：登录 X (Twitter)

1. Skill 首次运行时会打开 Chrome 并导航到 `https://x.com`
2. 手动完成登录（支持二步验证）
3. 登录完成后关闭标签页，skill 继续执行
4. 登录状态会持久化到 Chrome Profile，后续无需重复登录

---

## 第四步：macOS 权限（仅限 macOS）

sc-post-to-x 粘贴图片需要 Accessibility 权限：

1. **系统偏好设置** → **隐私与安全性** → **辅助功能**
2. 将你的终端应用（Terminal / iTerm2 / Warp 等）加入允许列表

---

## 常见问题

| 问题 | 解决方法 |
|------|----------|
| `Chrome debug port not ready` | 关闭所有 Chrome 实例，重试（脚本自带自愈逻辑） |
| `Session expired` | 重新运行 skill，它会提示重新登录 |
| `Port 9222 already in use` | `lsof -ti:9222 \| xargs kill -9` |
| 图片粘贴失败（macOS）| 检查 Accessibility 权限 |
| Chrome 未安装 | 下载 [Google Chrome](https://www.google.com/chrome/)，须使用完整版（非 Chromium）|

---

## 多 Profile 配置

如果需要为不同项目使用不同的登录状态（如多个 X 账号），可以通过环境变量切换：

```bash
SC_CHROME_PROFILE_DIR=~/.config/super-creator/profile-work ./sc-run sc-post-to-x x-browser "Hello"
SC_CHROME_PROFILE_DIR=~/.config/super-creator/profile-personal ./sc-run sc-post-to-x x-browser "Hello"
```
