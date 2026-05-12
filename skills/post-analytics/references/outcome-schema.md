# Post Analytics: Outcome Schema

Detailed documentation on the `outcome` field structure in the `ideas.jsonl` ledger.

## outcome Schema
(See original SKILL.md for the JSON structure ...)

## Eligibility Rules
A row is eligible for refresh when:
1. `claimed_by` is non-null.
2. `outcome` is null or older than 24h.
3. Published URL is present.
4. Within the `--since` window.
