import { markdownToHtml } from "../../../markdown/markdownToHtml.js";
import { GetMarkdownEvent } from "../types.js";

export async function handleGetMarkdown(
  message: GetMarkdownEvent
): Promise<string> {
  return await markdownToHtml(message.text);
}
