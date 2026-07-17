# ChatGPT 网页版生图操作指南

## 页面识别特征

ChatGPT 页面（https://chatgpt.com/）的关键元素：
- 输入框：`div[contenteditable="true"][role="textbox"]`（**不是 textarea！**）
- 占位文字："有问题，尽管问"
- 发送按钮：`role: button, name: "发送提示"`（生成中变为"停止回答"）
- 图片反馈按钮：`role: button, name: "喜欢此图片"` / `"不喜欢此图片"`
- 更多操作：`role: button, name: "更多操作"`（在图片附近）
- 图片元素：`role: img, name: "已生成图片：[描述]"`
- 全屏预览保存按钮：文字为"保存"的按钮（点击图片打开全屏后出现）

## 前置检查

1. 使用 `browser_tabs` 找到 ChatGPT 标签页
2. 调用 `browser_snapshot(interactive: true)` 检查状态：
   - 如果看到"登录"按钮 → 提示用户先在浏览器中登录
   - 如果看到输入框和"我们先从哪里开始呢？" → 就绪

## ⚠️ 重要：输入框的正确操作方式

**ChatGPT 的输入框是 contenteditable div，不是 textarea！** 直接设置 `.value` 无效，`browser_type` 也经常失败。

**正确方式：使用 `browser_evaluate` + `document.execCommand('insertText')`**

```javascript
// 找到输入框并聚焦
const editableDiv = document.querySelector('div[contenteditable="true"][role="textbox"]');
editableDiv.focus();

// 输入文字（必须用 execCommand，不能直接设 value）
document.execCommand('insertText', false, '你的提示词');

// 发送：用 Enter 键触发
editableDiv.dispatchEvent(new KeyboardEvent('keydown', {
  key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true
}));
```

> **为什么不用 `browser_type`？** ChatGPT 的输入框 ref 极易失效（页面动态重渲染导致 stale），用 `browser_evaluate` 直接操作 DOM 是最稳定的方式。

## 详细步骤（实战验证版）

### 步骤 1：输入提示词并发送

使用 `browser_evaluate` 一次性完成输入+发送：

```javascript
const editableDiv = document.querySelector('div[contenteditable="true"][role="textbox"]');
if (editableDiv) {
  editableDiv.focus();
  document.execCommand('insertText', false, '生成一张[描述]的图片，[风格要求]');
  editableDiv.dispatchEvent(new KeyboardEvent('keydown', {
    key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true
  }));
  return 'sent';
}
return 'input not found';
```

### 步骤 2：等待生成

```
等待循环（每次5秒，最多90秒）：
  - 检查是否存在"停止回答"按钮 → 还在生成中
  - 检查是否存在 img[alt*="已生成图片"] → 生成完成
  - 检查是否存在"喜欢此图片"按钮 → 生成完成
```

**生成时间**：通常 20-40 秒（DALL-E 3）

### 步骤 3：下载图片

**方式 1（推荐）：点击图片打开全屏，然后点"保存"按钮**

```javascript
// 1. 点击图片打开全屏预览
const img = document.querySelector('img[alt*="已生成图片"]');
img.click();

// 2. 等待全屏加载（1-2秒）
// 3. 找到并点击"保存"按钮
const saveBtn = Array.from(document.querySelectorAll('button'))
  .find(b => b.textContent?.trim() === '保存');
saveBtn.click();

// 4. 图片会下载到系统下载目录
```

**方式 2：通过"分享"按钮浮层下载**

图片下方有"分享此图片"按钮，点击后弹出的浮层里有下载选项：

```javascript
// 找到"分享"按钮并点击
const shareBtn = document.querySelector('button[aria-label*="分享此图片"]');
shareBtn.click();

// 等待浮层出现，然后找到下载按钮并点击
// 下载按钮可能是"下载"或"保存图片"选项
```

> 💡 提示：下载按钮隐藏在分享按钮打开的浮层中，不需要打开全屏预览也能下载。

**方式 3：提示用户手动保存（保底）**

如果自动下载遇到困难，直接提示用户：
> "图片已生成，请点击图片查看大图后右键选择'图片另存为'保存到本地。"

## DALL-E 提示词模板

### 写实照片风格
```
生成一张[主题]的照片，[场景描述]，
专业摄影风格，8k分辨率，自然光线，细节丰富，
photorealistic, high detail, professional photography.
```

### 3D 渲染 / 皮克斯风格
```
生成一张3D渲染风格的[主题]图片，[场景描述]，
皮克斯风格，柔和光照，高质量3D渲染，
Pixar style, 3D render, soft lighting, high quality.
```

### 插画风格
```
生成一张[主题]的插画，[风格描述如：卡通/水彩/扁平设计]，
[色彩方案]，[构图描述]，适合用于[用途如：文章配图/海报]，
illustration style, clean design, high quality.
```

### 赛博朋克风格
```
生成一张赛博朋克风格的[主题]图片，[场景描述]，
霓虹灯闪烁，未来感建筑，紫色和蓝色调，高质量插画，
cyberpunk style, neon lights, futuristic, purple and blue tones.
```

### 公众号封面图
```
为文章《[文章标题]》生成一张封面图，
[文章核心内容摘要]，
风格简洁大气，适合微信公众号封面尺寸（2.35:1），
色彩协调，有视觉吸引力。
```

## 常见问题

| 问题 | 解决方案 |
|------|---------|
| `browser_type` 报 element not found | 用 `browser_evaluate` + `execCommand('insertText')` 代替 |
| 输入了文字但按 Enter 没反应 | 确认操作的是 `div[contenteditable="true"]` 而不是 textarea |
| "更多操作"菜单里没有下载 | 不要用"更多操作"，下载按钮在"分享"浮层里，或开全屏后点"保存" |
| 生成速度慢 | DALL-E 3 通常需要 20-40 秒，耐心等待 |
| 图片不显示 | 刷新页面重试，或检查网络连接 |
| 提示"生成图片失败" | 调整提示词，避免敏感内容；重试一次 |
| ref 频繁失效（stale element） | 用 `browser_evaluate` 直接 querySelector，不要缓存 ref |
| 只生成了1张图 | 在提示词中明确说"生成2张/4张不同角度的图片" |

## 快速参考：生图操作 JS 片段

把这段代码直接丢给 `browser_evaluate` 就能完成一次生图：

```javascript
// 输入+发送
const div = document.querySelector('div[contenteditable="true"][role="textbox"]');
div.focus();
document.execCommand('insertText', false, '生成一张可爱的小猫图片，卡通风格');
div.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true }));
return 'sent';
```

检查是否生成完成：
```javascript
const img = document.querySelector('img[alt*="已生成图片"]');
const stopBtn = Array.from(document.querySelectorAll('button'))
  .find(b => b.getAttribute('aria-label')?.includes('停止'));
return JSON.stringify({ done: !!img && !stopBtn, hasImage: !!img, generating: !!stopBtn });
```

下载图片：
```javascript
const img = document.querySelector('img[alt*="已生成图片"]');
img.click();
// 等待1秒后
setTimeout(() => {
  const saveBtn = Array.from(document.querySelectorAll('button'))
    .find(b => b.textContent?.trim() === '保存');
  saveBtn?.click();
}, 1000);
return 'downloading';
```
