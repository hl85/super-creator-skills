# 环境变量与配置参考

super-creator 使用两种配置机制：

- **`.env` 文件** — 存放 API Key 等凭证（不提交 git）
- **`EXTEND.md` 文件** — 存放每个 skill 的使用偏好

本文档覆盖所有支持的环境变量和 `.env` 文件结构。

---

## 配置加载优先级

```
CLI 参数
    ↓ 覆盖
各 skill 的 EXTEND.md
    ↓ 覆盖
环境变量（shell export）
    ↓ 覆盖
项目级 .env：.super-creator/.env
    ↓ 覆盖
用户级 .env：~/.super-creator/.env
```

**推荐做法：**
- API Key 放 `~/.super-creator/.env`（一次配置，所有项目共享）
- 项目专属 key 放 `.super-creator/.env`
- 不要把包含 key 的 `.env` 文件提交到 git

---

## `.env` 文件模板

复制以下模板到 `~/.super-creator/.env`，填入你实际使用的 key，其余行保持注释即可：

```bash
# =============================================================================
# super-creator 用户级凭证配置
# 路径：~/.super-creator/.env
# 说明：填入你需要使用的 provider key，其余行无需修改
# =============================================================================

# ── 图像生成 ─────────────────────────────────────────────────────────────────

# Google（推荐，免费额度最多）
# 获取：https://aistudio.google.com/app/apikey
# GOOGLE_API_KEY=

# OpenAI
# 获取：https://platform.openai.com/api-keys
# OPENAI_API_KEY=

# Azure OpenAI（企业用户）
# AZURE_OPENAI_API_KEY=
# AZURE_OPENAI_BASE_URL=https://your-resource.openai.azure.com
# AZURE_OPENAI_DEPLOYMENT=gpt-image-1.5

# OpenRouter（聚合多个模型）
# 获取：https://openrouter.ai/keys
# OPENROUTER_API_KEY=

# DashScope / 阿里云（国内用户推荐）
# 获取：https://dashscope.aliyun.com/
# DASHSCOPE_API_KEY=

# MiniMax
# 获取：https://www.minimaxi.com/
# MINIMAX_API_KEY=

# Replicate
# 获取：https://replicate.com/account/api-tokens
# REPLICATE_API_TOKEN=

# ── 微信公众号 API 方式（browser 方式不需要）──────────────────────────────────
# 获取：微信公众平台 → 设置 → 开发设置 → AppID / AppSecret
# WECHAT_APP_ID=
# WECHAT_APP_SECRET=

# ── Chrome 路径覆盖（通常不需要设置）─────────────────────────────────────────
# 默认路径见：docs/chrome-profile.md
# SC_CHROME_PROFILE_DIR=
```

---

## 环境变量完整参考

### 图像生成

| 变量名 | 用途 | 使用的 Skill |
|--------|------|-------------|
| `GOOGLE_API_KEY` | Google Gemini 图像生成 | `imagine`、`cover-image`、`article-illustrator`、`comic`、`xiaohongshu-images`、`infographic`、`slide-deck` |
| `OPENAI_API_KEY` | OpenAI 图像生成 | 同上 |
| `AZURE_OPENAI_API_KEY` | Azure OpenAI | 同上 |
| `AZURE_OPENAI_BASE_URL` | Azure 端点 URL | 同上 |
| `AZURE_OPENAI_DEPLOYMENT` | Azure 部署名称 | 同上 |
| `OPENROUTER_API_KEY` | OpenRouter 聚合 | 同上 |
| `DASHSCOPE_API_KEY` | 阿里云 DashScope | 同上 |
| `MINIMAX_API_KEY` | MiniMax | 同上 |
| `REPLICATE_API_TOKEN` | Replicate | 同上 |

> 图像生成 skill 内部统一调用 `imagine`，只需配置你选定的 provider 的 key 即可。

### 微信公众号

| 变量名 | 用途 | 备注 |
|--------|------|------|
| `WECHAT_APP_ID` | 公众号 AppID | API 方式必填 |
| `WECHAT_APP_SECRET` | 公众号 AppSecret | API 方式必填 |
| `WECHAT_BROWSER_CHROME_PATH` | 自定义 Chrome 路径 | 通常不需要 |
| `WECHAT_BROWSER_PROFILE_DIR` | 微信专用 Chrome Profile | 通常不需要 |

> **多账号支持**：在 `.super-creator/post-to-wechat/EXTEND.md` 中配置 `accounts:` 数组，可管理多个公众号，无需多个环境变量。详见 `skills/post-to-wechat/references/multi-account.md`。

### Chrome & CDP

| 变量名 | 用途 | 适用 Skill |
|--------|------|-----------|
| `SC_CHROME_PROFILE_DIR` | 覆盖所有 CDP skill 的共享 Profile 路径 | `post-to-x`、`post-to-wechat`、`post-to-weibo`、`post-to-xhs`、`url-to-markdown`、`x-to-markdown`、`gemini-web` |
| `X_BROWSER_CHROME_PATH` | X 专用 Chrome 路径 | `post-to-x` |
| `X_CHROME_PROFILE_DIR` | X 专用 Profile 路径 | `post-to-x` |
| `WEIBO_BROWSER_CHROME_PATH` | 微博专用 Chrome 路径 | `post-to-weibo` |
| `WEIBO_BROWSER_PROFILE_DIR` | 微博专用 Profile 路径 | `post-to-weibo` |
| `GEMINI_WEB_CHROME_PATH` | Gemini Web 专用 Chrome 路径 | `gemini-web` |
| `GEMINI_WEB_CHROME_PROFILE_DIR` | Gemini Web 专用 Profile 路径 | `gemini-web` |

> 通常只需设置 `SC_CHROME_PROFILE_DIR`（如果默认路径不合适），其余都不需要。默认路径见 [chrome-profile.md](chrome-profile.md)。

### 高级调优

| 变量名 | 默认值 | 用途 |
|--------|--------|------|
| `SC_IMAGE_GEN_GOOGLE_CONCURRENCY` | `10` | Google 图像生成并发数 |
| `SC_IMAGE_GEN_GOOGLE_START_INTERVAL_MS` | `200` | Google 请求启动间隔（ms）|

---

## EXTEND.md 偏好配置概览

每个 skill 的使用偏好存储在 `EXTEND.md` 中，首次调用时自动创建，也可手动编辑。

| Skill | 主要偏好项 |
|-------|-----------|
| `imagine` | 默认 provider、模型、图像质量 |
| `cover-image` | 默认风格/调色板/渲染方式、水印、比例 |
| `article-illustrator` | 水印、默认风格、输出目录 |
| `comic` | 水印、艺术风格、基调 |
| `xiaohongshu-images` | 水印、默认风格、布局 |
| `translate` | 目标语言、翻译模式、受众、风格、术语表 |
| `post-to-wechat` | 主题、颜色、发布方式、作者、评论设置 |
| `post-to-weibo` | Chrome Profile 路径 |
| `post-to-xhs` | 默认话题标签、城市、草稿模式 |
| `url-to-markdown` | 媒体下载策略、默认输出目录 |
| `x-to-markdown` | 媒体下载策略、默认输出目录 |
| `infographic`、`slide-deck` | 水印、默认风格（首次运行时询问）|

> 删除 `EXTEND.md` 可重置对应 skill 的所有偏好，下次运行会重新引导设置。

---

## 自定义 Base URL（代理 / 私有部署）

所有图像生成 provider 支持自定义 API 端点，适合代理或私有部署场景：

| 变量名 | 用途 |
|--------|------|
| `OPENAI_BASE_URL` | OpenAI 兼容 API 端点 |
| `GOOGLE_BASE_URL` | Google API 代理端点 |
| `OPENROUTER_BASE_URL` | OpenRouter 端点 |
| `DASHSCOPE_BASE_URL` | DashScope 端点 |
| `MINIMAX_BASE_URL` | MiniMax 端点 |
| `REPLICATE_BASE_URL` | Replicate 端点 |

---

## 相关文档

- [quickstart.md](quickstart.md) — 10 分钟快速上手
- [chrome-setup.md](chrome-setup.md) — Chrome 首次配置详细步骤
- [chrome-profile.md](chrome-profile.md) — 各平台 Chrome Profile 默认路径
- [pipeline.md](pipeline.md) — 完整内容创作飞轮
