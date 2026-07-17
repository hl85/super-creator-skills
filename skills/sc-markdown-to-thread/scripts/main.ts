import { readFileSync, writeFileSync } from "node:fs";
import { extractSegments, packTweets } from "./slicer.ts";
import { addHook, addCta, numberThread } from "./compose.ts";

interface Args {
  input: string;
  output: string;
  maxLen: number;
  hook: "auto" | "off";
  cta: string;
  number: boolean;
}

function parseArgs(argv: string[]): Args {
  const args: Args = {
    input: "",
    output: "",
    maxLen: 270,
    hook: "auto",
    cta: "off",
    number: true,
  };
  const rest: string[] = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "-o" || a === "--output") args.output = argv[++i];
    else if (a === "--max-len") args.maxLen = Number(argv[++i]);
    else if (a === "--hook") args.hook = argv[++i] === "off" ? "off" : "auto";
    else if (a === "--cta") args.cta = argv[++i];
    else if (a === "--number") args.number = argv[++i] !== "off";
    else if (!a.startsWith("-")) rest.push(a);
  }
  if (!rest.length) {
    console.error(
      "usage: main.ts <input.md> [-o out] [--max-len n] [--hook auto|off] [--cta text|off] [--number on|off]",
    );
    process.exit(2);
  }
  args.input = rest[0];
  if (!args.output)
    args.output = args.input.replace(/\.md$/i, "") + ".thread.json";
  return args;
}

function extractTitle(md: string): string {
  const fmMatch = md.match(/^---\n([\s\S]*?)\n---/);
  if (fmMatch) {
    const t = fmMatch[1].match(/^title:\s*(.+)$/m);
    if (t) return t[1].replace(/^["']|["']$/g, "").trim();
  }
  const h1 = md.match(/^#\s+(.+)$/m);
  if (h1) return h1[1].trim();
  return "";
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const md = readFileSync(args.input, "utf-8");
  const title = extractTitle(md);
  const segs = extractSegments(md);
  let tweets = packTweets(segs, { maxLen: args.maxLen });
  tweets = addHook(tweets, { mode: args.hook, title, maxLen: args.maxLen });
  tweets = addCta(tweets, { text: args.cta });
  const numbered = numberThread(tweets, { enabled: args.number });
  writeFileSync(args.output, JSON.stringify(numbered, null, 2));
  console.log(`wrote ${numbered.length} tweets → ${args.output}`);
}

main();
