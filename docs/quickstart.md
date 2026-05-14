# 快速开始

从零到第一次成功运行，大约需要 10 分钟。

---

## 第一步：安装运行时

super-creator 的脚本通过 Bun 运行。

```bash
# macOS（推荐）
brew install oven-sh/bun/bun

# 或通过 npm
npm install -g bun

# 验证
bun --version
```

---

## 第二步：安装 Chrome

发布类和内容抓取类 skill 需要完整版 Google Chrome（不支持 Chromium）。

→ [下载 Google Chrome](https://www.google.com/chrome/)

安装完成后无需额外配置，skill 首次运行时会自动以调试模式启动它。

---

## 第三步：配置 API Key（图像生成类 skill 必须）

如果你打算使用 `imagine`、`cover-image`、`article-illustrator`、`comic`、`xhs-images`、`infographic` 等视觉 skill，需要至少一个图像生成 provider 的 API Key。

**推荐：Google（免费额度最多）**

1. 访问 [Google AI Studio](https://aistudio.google.com/app/apikey) 获取 API Key
2. 创建用户级凭证文件：

```bash
mkdir -p ~/.super-creator
cat >> ~/.super-creator/.env << 'EOF'
GOOGLE_API_KEY=your_key_here
EOF
```

其他 provider 的 key 名称见 [env-reference.md](env-reference.md)。

> **为什么放 `~/.super-creator/.env`？**
> 这是用户级凭证文件，所有项目共享，无需每个项目单独配置。项目级配置放 `.super-creator/.env`（优先级更高）。`.env` 文件已在 `.gitignore` 中，不会被提交。

---

## 第四步：运行第一个 skill

### 选项 A：图像生成（需要 API Key）

```bash
# 在任意目录下运行
./sc-run imagine main "a serene mountain lake at sunset"
```

首次运行会触发偏好设置对话（选择默认 provider、模型、质量），配置保存后下次直接执行。

### 选项 B：内容转换（无需任何配置）

```bash
# 格式化一篇 Markdown 文章
./sc-run format-markdown main article.md

# 翻译（首次运行会设置默认目标语言）
./sc-run translate main article.md --to zh-CN

# 下载 YouTube 字幕
./sc-run yt-transcript main "https://youtube.com/watch?v=..."
```

### 选项 C：发布到平台（需要 Chrome 登录）

```bash
# 发布到 X（首次运行会打开 Chrome 等待你登录）
./sc-run post-to-x x-browser "Hello from super-creator!"
```

首次运行时 Chrome 会自动打开，在浏览器里完成平台登录，登录状态持久保存，后续运行无需重复登录。

→ 详细 Chrome 配置步骤：[chrome-setup.md](chrome-setup.md)

---

## 偏好配置：每个 skill 首次运行自动引导

大多数 skill 首次调用时会通过 Claude 对话引导你完成偏好设置（主题、水印、输出目录等），设置结果保存为 `EXTEND.md`：

```
~/.super-creator/<skill-name>/EXTEND.md   ← 用户级（所有项目共享）
.super-creator/<skill-name>/EXTEND.md     ← 项目级（仅当前项目，优先级更高）
```

**你不需要手动创建这些文件**，skill 会在第一次运行时自动创建。如果想重置某个 skill 的偏好，删除对应 `EXTEND.md` 即可。

---

## 本地开发：注册项目级插件

如果你在本地克隆这个仓库进行开发，可以通过以下方式让 Claude Code 立即加载你的改动：

### 推荐：项目级插件自动加载（无需额外配置）

Claude Code 启动时会自动扫描项目根目录的 `.claude-plugin/marketplace.json`，加载所有 skill。**无需手动注册**——只要在项目目录打开 Claude Code，改动即时生效。

### 备选 1：符号链接到共享 skills 目录（自动同步改动）

```bash
# 创建项目的符号链接
ln -sf /path/to/super-creator ~/.agents/super-creator-dev

# 更新共享 skills 目录的 symlink（以 imagine 为例）
rm ~/.agents/skills/imagine
ln -sf /path/to/super-creator/skills/imagine ~/.agents/skills/imagine

# 对其他开发中的 skill 重复上述操作
```

优点：本地编辑后立即生效，无需手动复制。缺点：需要在每个 skill 目录单独建立 symlink。

### 备选 2：复制到共享 skills 目录（一次性同步）

```bash
# 将开发中的 skill 复制到共享目录
cp -r ./skills/imagine ~/.agents/skills/
cp -r ./skills/article-illustrator ~/.agents/skills/
cp -r ./skills/comic ~/.agents/skills/
# ... 对其他 skill 重复

# 编辑后需要手动重复此命令以更新
```

---

## 常见问题

**Q：运行时报 `bun: command not found`**
→ 重新打开终端，或运行 `source ~/.zshrc`（zsh）/ `source ~/.bashrc`（bash）

**Q：图像生成失败，提示 API Key 无效**
→ 检查 `~/.super-creator/.env` 里的 key 是否正确，无多余空格或换行

**Q：Chrome 无法启动**
→ 确认安装的是完整版 Google Chrome（不是 Chromium），见 [chrome-setup.md](chrome-setup.md)

**Q：如何查看当前配置了哪些 skill？**
→ 运行 `ls ~/.super-creator/` 查看已有 EXTEND.md 的 skill

**Q：WeChat 发布需要什么凭证？**
→ API 方式需要 `WECHAT_APP_ID` + `WECHAT_APP_SECRET`（需要微信公众号后台申请）；Browser 方式只需要 Chrome 扫码登录，见 [env-reference.md](env-reference.md)

---

## 下一步

- [env-reference.md](env-reference.md) — 所有环境变量和 `.env` 配置参考
- [pipeline.md](pipeline.md) — 完整内容创作飞轮
- [visuals.md](visuals.md) — 选择合适的视觉 skill
- [chrome-setup.md](chrome-setup.md) — Chrome 首次配置详细步骤
