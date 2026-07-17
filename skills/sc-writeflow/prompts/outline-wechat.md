# Outline Procedure — WeChat 公众号

Run **before** drafting. The outline locks structure so the draft doesn't drift.

## Step 1 — Read all sources

Read every input file end to end. If a source is > 5000 字, summarize it in 5 bullets first, then continue.

## Step 2 — Extract candidate claims

List every distinct factual or opinion claim across the sources. Keep ≤ 25; group near-duplicates.

## Step 3 — Pick ONE core claim

The whole article will argue **exactly one** claim. Bias toward:
- Counter-intuitive (反共识)
- Concrete (with numbers, names, dates)
- Within author's authority (avoid "我猜世界局势会怎样")

If sources don't support a strong single claim, stop and tell the user: "sources too thin / too scattered, need <X>". Don't invent a claim.

## Step 4 — Identify the reader

Write **one sentence** answering: who is this for, what do they currently believe, and what will they walk away with? 越具体越好（"想转独立开发的厂里前端，目前以为 SaaS 已饱和"）。

## Step 5 — Steelman the counter-view

Write the strongest objection in one sentence. If you can't write a credible counter-view, the claim is too weak — go back to Step 3.

## Step 6 — Choose structure

Pick one from `references/wechat-style.md` "Body 结构" table. Justify in one sentence.

## Step 7 — Draft section list

Produce 4–8 sections (depending on `--length`):
- short → 4 sections, ~1500 字 target
- medium → 6 sections, ~2500 字 target
- long → 8 sections, ~4000 字 target

For each section, write:
- title (作为 `##` 小标题)
- 1–3 bullets (each pointing to a source quote/anchor)

## Step 8 — Hook + CTA

- Hook (第一段): one of the 3 patterns from `wechat-style.md`. Write it out, ≤ 80 字.
- CTA (last section): one concrete question / next-step.

## Step 9 — Source map

Below structure, list every claim ↔ source file/anchor. If a claim has no source, mark it `[opinion: author]` or remove.

## Step 10 — Emit outline.md

Use the schema in SKILL.md. Save to the user-specified path.

## Anti-patterns the outliner must avoid

- ❌ Generic 5-section template (intro / 3 points / conclusion) without justifying it
- ❌ Inventing facts not in sources
- ❌ Writing draft prose in the outline (bullets only)
- ❌ Multiple core claims ("we'll discuss A, B, and C" — pick one)
- ❌ Ignoring `--angle` if user provided it
