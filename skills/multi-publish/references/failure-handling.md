# Failure Handling

Decision tree for when a step fails. The agent should consult this before deciding to retry, skip, or abort.

## Step 1 (content-review) failures

| Symptom | Action |
|---------|--------|
| `content-review` script crashed (exit ≠ 0) | Retry once. If still crashing, abort and tell the user — review can't be skipped silently. |
| Review report `BLOCK` | Abort the entire run. Print the BLOCK reason and the offending excerpt. Exit code 1. |
| Review report `REVIEW` | Pause; show issues to user; wait for `y/N` confirmation. Default no on no-input. |
| Review report `PASS` | Proceed silently. |

## Step 2 (adapter) failures

Each platform's adapter is independent. If one fails:

- Print the failing platform and the adapter's stderr.
- **Continue** the other platforms' adapters.
- Mark the failing platform as `adapter-failed` in `run-log.md` and skip it in Step 4.

If **all** adapters fail, abort.

## Step 3 (image compression) failures

| Symptom | Action |
|---------|--------|
| Single image fails to compress | Log warning; keep the original; continue. The publisher may reject it later — that's fine, the publisher's failure is more informative. |
| All images fail (e.g., compress-image script broken) | Log; continue with originals. Don't abort — many articles have no images. |

## Step 4 (publish) failures

CDP publishers fail for many reasons (Chrome lock, login expired, network). Rules:

| Symptom | Action |
|---------|--------|
| Chrome singleton conflict | Tell user to close Chrome / use a different profile; retry once after they confirm. |
| Login expired (publisher prompts) | Open browser, let user log in, then re-invoke just that publisher. |
| Network timeout | Retry once with `--timeout 240000`. |
| Validation error (e.g., title missing) | Do NOT retry. Print the error, mark platform failed, continue others. |
| Unknown error | Mark failed, continue, surface the publisher's `publish.log` path in final report. |

A failed publish on platform A does **not** roll back already-successful publishes on B and C. Cross-platform consistency is the user's call.

## Cross-platform partial-success report

After all steps, the final report MUST clearly say which platforms made it. Example:

```
multi-publish complete (publish mode)
out-dir: ./publish-out/20260429T101530Z/
- wechat: PUBLISHED https://mp.weixin.qq.com/s/abc123
- x:      FAILED   see ./publish-out/.../x/publish.log
- weibo:  PUBLISHED https://weibo.com/12345
review:   PASS
```

Do not silently treat a partial publish as success. Surface failures prominently.

## What never to do

- ❌ Retry a `BLOCK` review by tweaking and re-running review (that's lying to the user)
- ❌ Run all publishers in parallel after one fails (CDP collision)
- ❌ Auto-translate or auto-rewrite an article to "fix" a review failure
- ❌ Auto-uninstall / reinstall Chrome on a singleton conflict (filesystem damage risk)
