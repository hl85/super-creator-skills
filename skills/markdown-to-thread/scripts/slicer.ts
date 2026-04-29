import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkFrontmatter from "remark-frontmatter";
import { visit } from "unist-util-visit";

export interface Segment {
  kind: "heading" | "paragraph" | "listItem";
  text: string;
}

function nodeText(node: any): string {
  let out = "";
  visit(node, (child: any) => {
    if (child.type === "text" || child.type === "inlineCode") {
      out += child.value;
    }
  });
  return out.trim();
}

export function extractSegments(markdown: string): Segment[] {
  const tree = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkFrontmatter, ["yaml"])
    .parse(markdown) as any;

  const segs: Segment[] = [];
  for (const node of tree.children ?? []) {
    if (node.type === "yaml" || node.type === "code") continue;
    if (node.type === "heading") {
      const t = nodeText(node);
      if (t) segs.push({ kind: "heading", text: t });
    } else if (node.type === "paragraph") {
      const t = nodeText(node);
      if (t) segs.push({ kind: "paragraph", text: t });
    } else if (node.type === "list") {
      for (const item of node.children ?? []) {
        const t = nodeText(item);
        if (t) segs.push({ kind: "listItem", text: t });
      }
    } else if (node.type === "blockquote") {
      const t = nodeText(node);
      if (t) segs.push({ kind: "paragraph", text: t });
    }
  }
  return segs;
}

export interface PackOptions {
  maxLen: number;
}

const SENTENCE_END = /([.!?。！？…]+["')\]]?)\s+/g;

function splitOversize(text: string, maxLen: number): string[] {
  const out: string[] = [];
  let rest = text;
  while (rest.length > maxLen) {
    let cut = -1;
    SENTENCE_END.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = SENTENCE_END.exec(rest)) !== null) {
      const end = m.index + m[0].length;
      if (end > maxLen) break;
      cut = end;
    }
    if (cut <= 0) cut = maxLen;
    out.push(rest.slice(0, cut).trimEnd());
    rest = rest.slice(cut).trimStart();
  }
  if (rest.length) out.push(rest);
  return out;
}

export function packTweets(segments: Segment[], opts: PackOptions): string[] {
  const { maxLen } = opts;
  const tweets: string[] = [];
  let buf = "";
  const flush = () => {
    if (buf.trim()) tweets.push(buf.trim());
    buf = "";
  };

  for (const seg of segments) {
    const pieces =
      seg.text.length > maxLen ? splitOversize(seg.text, maxLen) : [seg.text];
    for (const piece of pieces) {
      if (!buf) {
        buf = piece;
        continue;
      }
      const candidate = buf + "\n\n" + piece;
      if (candidate.length <= maxLen) {
        buf = candidate;
      } else {
        flush();
        buf = piece;
      }
    }
  }
  flush();
  return tweets;
}
