import { getHtmlForCode } from "../../../sourceAnalysis/getHtmlForCode.js";
import { getLangFromFilename } from "../../../sourceAnalysis/getLangFromFilename.js";
import { SourceCodeToHtmlEvent } from "../types.js";

export async function handleSourceCodeToHtml(
  message: SourceCodeToHtmlEvent
): Promise<string> {
  return getHtmlForCode(
    message.content,
    getLangFromFilename(message.filePath)
  );
}