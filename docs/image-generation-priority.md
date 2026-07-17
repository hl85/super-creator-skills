# 图片生成引擎优先级策略（v3.4.0+）

## 优先级总览

| 优先级 | 引擎 | Skill | 适用场景 | 优点 | 缺点 |
|--------|------|-------|---------|------|------|
| **1（首选）** | 网页 AI | `sc-web-ai` | 大多数场景，无 API Key 时 | 免费、无需 Key、效果好（Nano Banana/DALL-E） | 需要浏览器已登录 |
| **2（次选）** | 官方 API | `sc-imagine` | 批量生成、需要稳定输出、有 API Key 时 | 速度快、可批量、稳定 | 需要 API Key、有成本 |
| ~~3（已移除）~~ | ~~混元 DashScope~~ | ~~sc-imagine/dashscope~~ | ~~fallback~~ | ~~国内访问快~~ | ~~效果不佳，已从自动 fallback 中移除~~ |

---

## 详细决策流程

```
开始生图
    ↓
检查用户是否在 IDE 浏览器中打开并登录了 Gemini/ChatGPT？
    ├─ 是 → 使用 sc-web-ai（网页生图）
    │       ↳ 优先 Gemini Nano Banana（中文提示词也可）
    │       ↳ 备选 ChatGPT DALL-E
    │       ↳ 图片下载到本地后继续流程
    │
    └─ 否 → 检查是否有可用的 API Key？
            ├─ 有 → 使用 sc-imagine（API 生图）
            │       ↳ 自动选择优先级：Google → OpenAI → Azure → OpenRouter → Replicate → Seedream → MiniMax → Jimeng
            │       ↳ 注意：DashScope（混元）已从自动 fallback 中移除，效果不佳
            │       ↳ 用户可通过 --provider dashscope 主动指定使用
            │
            └─ 无 → 提示用户二选一：
                    1. 在浏览器中打开 Gemini/ChatGPT 并登录（推荐，免费）
                    2. 配置 API Key
```

---

## 各引擎使用建议

### sc-web-ai（网页 AI，首选）

**适用场景：**
- 单张或少量图片生成
- 没有 API Key 或不想花钱
- 需要 Nano Banana 等网页特色风格
- 日常内容创作配图

**前置条件：**
- IDE 内置浏览器可用（TRAE 已内置）
- 用户已在浏览器中打开并登录：
  - https://gemini.google.com/ （推荐，Nano Banana 风格效果好）
  - https://chatgpt.com/ （备选）

**使用方式：**
- 直接描述图片需求，AI 会自动操作浏览器完成生图和下载
- 不需要命令行调用，自然语言交互即可

---

### sc-imagine（官方 API，次选）

**适用场景：**
- 批量生成多张图片
- 需要精确控制参数（尺寸、质量、风格参考图）
- 有稳定的 API Key
- 需要无人值守自动化

**Provider 优先级（自动检测，有 Key 就用）：**
1. **Google** (`google`) - Imagen 3，质量高，支持参考图
2. **OpenAI** (`openai`) - GPT Image 1.5，DALL-E 继任者
3. **Azure OpenAI** (`azure`) - OpenAI 的 Azure 托管版本
4. **OpenRouter** (`openrouter`) - 聚合平台，可访问多种模型
5. **Replicate** (`replicate`) - 可访问 Nano Banana API 版本
6. **Seedream** (`seedream`) - 豆包 Seedream，火山引擎
7. **MiniMax** (`minimax`) - 海螺 AI
8. **Jimeng** (`jimeng`) - 即梦 AI

**关于 DashScope（混元）：**
- ❌ 已从自动 fallback 链中移除
- ❌ 效果不佳，不再作为默认选项
- ✅ 保留代码支持，用户可通过 `--provider dashscope` 主动使用
- ✅ 如果用户在 EXTEND.md 中配置了 `default_provider: dashscope`，仍然尊重用户选择

---

## 各 Skill 的引擎选择规范

所有涉及图片生成的 Skill 都必须遵循此优先级：

| Skill | 图片生成方式 | 遵循优先级 |
|-------|-------------|-----------|
| `sc-xhs-images` | 小红书信息图 | ✅ 先 web-ai，失败/批量再 API |
| `sc-cover-image` | 封面图 | ✅ 先 web-ai，需要特定尺寸时 API |
| `sc-article-illustrator` | 文章插画 | ✅ 先 web-ai，批量/风格参考时 API |
| `sc-pipeline` | 流水线编排 | ✅ 统一按此优先级调度 |

---

## 给 AI 的操作指令

当用户需要生成图片时：

1. **第一步：检查 web-ai 可用性**
   - 调用 `browser_tabs` 查看是否有 Gemini/ChatGPT 标签页
   - 如果有且已登录，优先使用 sc-web-ai
   - 如果没有，提示用户："请在 IDE 浏览器中打开 gemini.google.com 并登录，我可以帮你免费生图"

2. **第二步：如果 web-ai 不可用，使用 API**
   - 调用 sc-imagine
   - 自动检测可用的 API Key
   - 按优先级选择 provider
   - 如果没有任何 Key，提示用户配置

3. **禁止行为**
   - 不要默认使用混元 DashScope
   - 不要一开始就让用户配置 API Key（先推荐免费的网页方式）
   - 不要自己写反向工程代码调用 Web 私有 API（已删除 sc-gemini-web）
