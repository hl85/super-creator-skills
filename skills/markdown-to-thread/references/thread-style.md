# X Thread Style Notes

This skill performs **mechanical** slicing only. Hook quality, narrative pacing, and CTA wording are still authoring decisions. When a model is generating the source markdown to feed this skill, follow these rules:

## Hook tweet (tweet 1)

- One sentence. Promise a payoff.
- No "in this thread we'll discuss…". Show, don't announce.
- Numbers, contrasts, or contrarian claims outperform.

## Body tweets

- One idea per tweet. Don't pack two arguments into one tweet just because they fit.
- Start each tweet with a strong noun or verb; avoid pronouns that depend on the prior tweet.
- Use empty lines to give the eye breath; X collapses single newlines.

## CTA tweet (last)

- Either: link to source/article, ask a concrete question, or invite RT.
- Avoid "follow me for more" — low signal.

## What this skill does NOT do

- Doesn't rewrite content.
- Doesn't translate.
- Doesn't generate images.
- Doesn't post — pipe the output JSON into `post-to-x`.
