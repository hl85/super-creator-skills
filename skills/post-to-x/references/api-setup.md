# X API v2 设置指南

本文档说明如何配置 X (Twitter) 官方 API v2 用于自动发布。

---

## 为什么用 API 而不是浏览器自动化？

| 对比项 | API v2 | 浏览器 CDP |
|--------|--------|-----------|
| **稳定性** | ⭐⭐⭐⭐⭐ 官方接口，稳定可靠 | ⭐⭐⭐ 依赖网页结构，可能失效 |
| **风控风险** | 🟢 低（官方支持的方式） | 🟡 中（模拟真人行为） |
| **速度** | ⚡ 快（HTTP 请求，秒级） | 🐢 慢（浏览器操作，10s+） |
| **依赖** | 只需 API Key | 需要 Chrome、登录态、剪贴板权限 |
| **额度限制** | 免费 1,500 条/月 | 无明确限制 |

---

## 快速开始（3 步）

### Step 1：获取 API 凭证

1. 访问 [developer.x.com](https://developer.x.com/)
2. 使用你的 X 账号登录
3. 创建一个 Project 和 App
4. 在 App 的 "Keys and tokens" 页面获取以下凭证：
   - **API Key and Secret**（Consumer Key / Consumer Secret）
   - **Access Token and Secret**（需要 OAuth 1.0a 权限）

> ⚠️ **注意**：确保 Access Token 有 **Read and Write** 权限，否则无法发布推文。

### Step 2：配置凭证

#### 方式 A：环境变量（推荐，最安全）

在 `.zshrc` / `.bashrc` / `.env` 中设置：

```bash
export X_API_KEY="your_api_key_here"
export X_API_SECRET="your_api_secret_here"
export X_ACCESS_TOKEN="your_access_token_here"
export X_ACCESS_TOKEN_SECRET="your_access_token_secret_here"
```

#### 方式 B：EXTEND.md（项目级配置）

在项目根目录的 `EXTEND.md` 中添加：

```yaml
x:
  default_publish_method: api
  accounts:
    - name: "My X Account"
      alias: "main"
      default: true
      api_key: "your_api_key"
      api_secret: "your_api_secret"
      access_token: "your_access_token"
      access_token_secret: "your_access_token_secret"
```

> 💡 支持多账号！添加多个 account 配置，用 `--account <alias>` 切换。

### Step 3：验证配置

```bash
./sc-run post-to-x x-api --check
```

输出应该显示：
```
Publish method: api
API credentials: ✅ configured
```

---

## 使用方法

### 发布纯文本

```bash
./sc-run post-to-x x-api "Hello from API!"
```

### 发布带图片

```bash
./sc-run post-to-x x-api "Check out this image!" --image ./photo.png
./sc-run post-to-x x-api "Multiple images!" --image ./1.png --image ./2.png --image ./3.png --image ./4.png
```

### 指定账号

```bash
./sc-run post-to-x x-api "Hello from work account" --account work
```

### 强制使用浏览器模式

```bash
./sc-run post-to-x x-browser "Hello via browser" --image ./photo.png
```

---

## 免费额度说明

X API v2 免费版额度：

| 项目 | 免费额度 |
|------|---------|
| **发布推文** | ~1,500 条/月 |
| **读取数据** | 有限制 |
| **上传媒体** | 包含在发布额度内 |

> 个人创作者每天发 1-2 条完全够用。如果需要更多，可以升级到 Basic 套餐（$100/月）。

---

## 支持的功能

| 功能 | API v2 支持 | 说明 |
|------|------------|------|
| 纯文本推文 | ✅ | |
| 图片推文（1-4 张） | ✅ | PNG, JPG, GIF, WebP |
| 视频推文 | ⚠️ 需额外开发 | 目前用 CDP 模式 |
| Quote Tweet | ⚠️ 需额外开发 | 目前用 CDP 模式 |
| X Article 长文 | ❌ | 用 CDP 模式 |
| Thread 线程 | ⚠️ 需额外开发 | 目前用 CDP 模式 |

---

## 常见问题

### Q: 为什么不直接用 Bearer Token？

A: Bearer Token 只能用于读取公开数据，**发布推文需要 OAuth 1.0a**（API Key + Access Token）。

### Q: API 模式和浏览器模式可以同时用吗？

A: 可以。默认 API 优先，API 不可用时会提示你切换到浏览器模式。也可以用 `--method browser` 强制用浏览器。

### Q: Access Token 会过期吗？

A: X 的 OAuth 1.0a Access Token 默认不会过期，除非用户手动撤销或应用权限被更改。

### Q: 怎么知道 API 额度用完了？

A: 发布时会返回 `429 Too Many Requests` 错误。可以在 developer.x.com 后台查看用量。

---

## 相关文档

- [X Developer Portal](https://developer.x.com/)
- [X API v2 Documentation](https://developer.x.com/en/docs/twitter-api)
- [Regular Posts Guide](./regular-posts.md)
