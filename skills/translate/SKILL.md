---
name: translate
description: Translates articles and documents between languages with three modes - quick (direct), normal (analyze then translate), and refined (analyze, translate, review, polish). Supports custom glossaries and terminology consistency via EXTEND.md. Use when user asks to "translate", "翻译", "精翻", "translate article", "translate to Chinese/English", "改成中文", "改成英文", "convert to Chinese", "localize", "本地化", or needs any document translation. Also triggers for "refined translation", "精细翻译", "proofread translation", "快速翻译", "快翻", "这篇文章翻译一下", or when a URL or file is provided with translation intent.
version: 1.59.0
---

# Translator

High-quality translation with three modes: **Quick**, **Normal**, and **Refined**.

## Usage

All commands use `./sc-run translate <script>`.

```bash
# Normal mode (Analyze -> Translate)
./sc-run translate main article.md --to zh-CN

# Quick mode (Direct)
./sc-run translate main article.md --to en --mode quick

# Refined mode (Analyze -> Translate -> Review -> Polish)
./sc-run translate main article.md --mode refined
```

## Intents

- **Quick Translation**: Fast, direct translation for informal content.
- **Normal Translation**: Balanced quality with terminology consistency.
- **Refined Translation**: Publication-quality output with multi-pass refinement.
- **Chunked Translation**: Handle long documents (4000+ words) via sub-agents.

## Progressive Disclosure

For detailed workflows, style presets, and glossary management, see:

- [references/workflow.md](references/workflow.md) - **Normal & Chunked Workflows**
- [references/refined-workflow.md](references/refined-workflow.md) - **Publication-Quality Steps**
- [references/glossaries-and-styles.md](references/glossaries-and-styles.md) - **Presets & Glossary Schema**
- [references/config/preferences-schema.md](references/config/preferences-schema.md) - **EXTEND.md Options**
