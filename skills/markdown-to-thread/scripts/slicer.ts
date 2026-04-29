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
