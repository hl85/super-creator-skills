# Factcheck Pass Procedure

Verifies *checkable* claims via `agent-reach`. Does not opine on opinions.

## Step 1 — Extract claims

Read the article and extract claims that are **objectively verifiable**:

| Claim type | Examples |
|-----------|----------|
| Numeric | "GDP grew 5.2% in 2024", "1.4M users" |
| Dated event | "Released on March 12 2025" |
| Named-entity attribution | "Hinton said X", "OpenAI announced Y" |
| Quoted statement | Anything in “quotes” attributed to someone |
| External citation | "according to Nature, …" |

**Skip:**
- The author's own opinions
- Hypotheticals ("imagine if…")
- Common knowledge that doesn't need a citation ("water boils at 100°C")
- Anecdotes with no verifiable subject

Cap at **15 claims** per article. If more, pick the most consequential.

## Step 2 — Verify via agent-reach

For each claim, run a search:

```
mcporter call 'exa.web_search_exa(query: "<paraphrased claim>", numResults: 3)'
```

Or for source-specific claims:
```
mcporter call 'exa.web_search_exa(query: "<entity> <year> <topic>", numResults: 5)'
```

Read the top results (use the agent-reach `web` channel). Do **not** fabricate URLs.

## Step 3 — Grade each claim

Use exactly four verdicts:

| Verdict | Meaning |
|---------|---------|
| `supported` | At least 2 independent reputable sources confirm |
| `partially-supported` | Sources confirm part of the claim, but a number/date/attribution differs |
| `unsupported` | No reputable source found in 3 minutes of searching |
| `contradicted` | A reputable source says the opposite |

Treat `unsupported` and `contradicted` as **REVIEW** severity (let author decide). Only escalate to BLOCK if the claim is also defamatory or medical/financial advice.

## Step 4 — Emit the section

Each entry should include:

```markdown
### [REVIEW] <claim verbatim>
**Source(s):** <URL 1>, <URL 2>
**Verdict:** partially-supported
**Note:** Sources show 5.0% (IMF) not 5.2%; consider citing IMF directly.
```

## Step 5 — Link health subsection

Separately, for **every URL in the article body**:

```bash
curl -sI -L -o /dev/null -w "%{http_code} %{url_effective}\n" "<url>"
```

Or use `agent-reach` web read. Record final status code and effective URL (after redirects). Flag:
- 4xx / 5xx → **REVIEW** with note
- Redirected to login/paywall → **REVIEW**
- Different domain than expected → **REVIEW**

Render as a markdown table per the schema in SKILL.md.

## Anti-patterns the reviewer must avoid

- ❌ Fabricating URLs or pretending to have searched
- ❌ Marking a claim `supported` when only the author's own blog corroborates
- ❌ Spending more than ~3 minutes per claim
- ❌ Verifying opinions ("X is the best framework" is not factcheckable)
- ❌ Using `BLOCK` for factcheck issues unless legally risky
