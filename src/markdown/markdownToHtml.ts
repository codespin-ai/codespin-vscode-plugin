import { marked } from "marked";

export async function markdownToHtml(content: string) {
  const html = await marked(content, {
    gfm: true,
    breaks: true,
  });

  return html;
}
