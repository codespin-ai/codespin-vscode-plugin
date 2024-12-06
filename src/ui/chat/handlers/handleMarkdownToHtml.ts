import { markdownToHtml as convertMarkdownToHtml } from "../../../markdown/markdownToHtml.js";
import { MarkdownToHtmlEvent } from "../types.js";

export async function handleMarkdownToHtml(
  message: MarkdownToHtmlEvent
): Promise<string> {
  return convertMarkdownToHtml(message.content);
}