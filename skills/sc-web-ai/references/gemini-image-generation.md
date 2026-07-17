# Gemini 网页版生图操作指南

## 页面识别特征

Gemini 页面（https://gemini.google.com/app）的关键元素：
- 输入框：`role: textbox, name: "为 Gemini 输入提示"`
- 发送按钮：`role: button, name: "发送"`
- 生成中状态：`role: button, name: "停止回答"`
- 下载按钮：`role: button, name: "下载完整尺寸的图片"`
- 图片元素：`role: img, name: "，AI 生成"`

## 前置检查

1. 使用 `browser_tabs` 找到 Gemini 标签页
2. 调用 `browser_snapshot(interactive: true)` 检查状态：
   - 如果看到"登录"按钮 → 提示用户先在浏览器中登录
   - 如果看到输入框 → 就绪，可以开始生图

## 详细步骤

### 步骤 1：选择并聚焦输入框

```
1. 从 snapshot 中找到输入框的 ref（通常是名称包含"为 Gemini 输入提示"的 textbox）
2. browser_click(ref: 输入框ref)
3. 确认输入框状态变为 [active, focused]
```

### 步骤 2：输入提示词

**提示词建议：**
- 优先使用英文提示词，Nano Banana 风格效果更好
- 明确说明"generate an image"
- 指定风格、背景、色彩等细节

```
browser_type(
  ref: 输入框ref,
  text: "Generate an image in Nano Banana style: [描述]. " +
        "Cute hand-drawn 2D illustration, soft colors, simple shapes, white background."
)
```

### 步骤 3：发送并等待生成

```
1. 从 snapshot 中找到"发送"按钮（生成中会变成"停止回答"）
2. browser_click(ref: 发送按钮ref)
3. 等待循环：
   - 等待 3-5 秒
   - browser_snapshot()
   - 检查"停止回答"按钮是否消失
   - 检查是否出现"下载完整尺寸的图片"按钮
   - 检查是否出现 img 元素
   - 超时时间：60秒
```

### 步骤 4：下载图片

Gemini 提供原生下载按钮，这是最简单可靠的方式：

```
1. 从 snapshot 中找到"下载完整尺寸的图片"按钮
2. browser_click(ref: 下载按钮ref)
3. 按钮会变为 disabled 状态，表示下载已触发
4. 等待几秒让浏览器完成下载
5. 提示用户图片已保存到默认下载目录
```

**备选方案（如果需要指定保存路径）：**
```
1. 点击图片查看大图
2. browser_evaluate 执行右键点击
3. 选择"Save image as..."
4. 或者获取图片 src URL 后提示用户手动下载
```

## Nano Banana 风格提示词模板

### 可爱卡通风格
```
Generate an image in Nano Banana style: [主题描述].
Cute hand-drawn 2D illustration, soft pastel colors, simple shapes,
warm and friendly feeling, white background, chibi style.
```

### 公众号配图风格
```
Generate an illustration in Nano Banana style for WeChat article:
[描述文章主题]. Clean design, suitable for article header,
soft colors, minimalist composition, white background.
```

### 商务简约风格
```
Generate a flat illustration in Nano Banana style about [主题],
business casual style, blue and gray color scheme, clean lines,
professional look, white background.
```

## 常见问题

| 问题 | 解决方案 |
|------|---------|
| 一直转圈不生成 | 刷新页面重试，可能触发了限流；或等待几分钟再试 |
| 提示"无法生成图片" | 调整提示词，避免敏感词；简化描述重试 |
| 图片加载失败 | 右键点击图片选择"重新加载图片" |
| 下载按钮没反应 | 右键图片选择"图片另存为" |
| 需要多张图片 | 在提示词中明确要求"generate 4 images"等 |
| ref 失效（stale element） | 重新 snapshot 获取最新 ref，或用 browser_evaluate 直接操作 |

## 快速参考：生图操作 JS 片段

如果 `browser_type` 和 ref 不稳定，可以用 `browser_evaluate` 直接操作：

```javascript
// 输入+发送
const textarea = document.querySelector('textarea[aria-label*="Gemini 输入提示"]') 
  || document.querySelector('textarea[aria-label*="为 Gemini"]');
textarea.value = 'Generate an image in Nano Banana style: a cute cat. Cute hand-drawn 2D illustration, soft colors, white background.';
textarea.dispatchEvent(new Event('input', { bubbles: true }));
const sendBtn = document.querySelector('button[aria-label="发送"]');
sendBtn.click();
return 'sent';
```

检查是否生成完成：
```javascript
const downloadBtn = document.querySelector('button[aria-label*="下载完整尺寸"]');
const stopBtn = document.querySelector('button[aria-label*="停止回答"]');
const imgs = document.querySelectorAll('img[alt*="AI 生成"]');
return JSON.stringify({ done: !!downloadBtn && !stopBtn, imgCount: imgs.length, generating: !!stopBtn });
```

下载图片：
```javascript
const downloadBtn = document.querySelector('button[aria-label*="下载完整尺寸"]');
downloadBtn.click();
return 'downloading';
```
