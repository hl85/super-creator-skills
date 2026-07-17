export interface Tweet {
  index: number;
  total: number;
  text: string;
}

export interface HookOptions {
  mode: "auto" | "off";
  title: string;
  maxLen: number;
}

export function addHook(tweets: string[], opts: HookOptions): string[] {
  if (opts.mode === "off" || !opts.title.trim()) return tweets;
  let hook = opts.title.trim();
  if (hook.length > opts.maxLen) hook = hook.slice(0, opts.maxLen);
  return [hook, ...tweets];
}

export interface CtaOptions {
  text: string;
}

export function addCta(tweets: string[], opts: CtaOptions): string[] {
  const t = (opts.text ?? "").trim();
  if (!t || t === "off") return tweets;
  return [...tweets, t];
}

export interface NumberOptions {
  enabled: boolean;
}

export function numberThread(
  tweets: string[],
  opts: NumberOptions,
): Tweet[] {
  const total = tweets.length;
  return tweets.map((text, i) => ({
    index: i + 1,
    total,
    text: opts.enabled ? `${text}\n\n${i + 1}/${total}` : text,
  }));
}
