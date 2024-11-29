import { StreamingFileParseResult } from "codespin/dist/responseParsing/streamingFileParser.js";
import { ProcessedStreamingFileParseResult } from "./types";
import { getHtmlForCode } from "../../../sourceAnalysis/getHtmlForCode.js";
import { getLangFromFilename } from "../../../sourceAnalysis/getLangFromFilename.js";

export async function processStreamingFileParseResult(
  input: StreamingFileParseResult
): Promise<ProcessedStreamingFileParseResult> {
  if (input.type === "end-file-block") {
    const html = await getHtmlForCode(
      input.file.content,
      getLangFromFilename(input.file.path)
    ); // Assuming "javascript" as the language. Adjust as needed.
    return {
      ...input,
      html,
    };
  }

  // For all other types, return as-is
  return input as ProcessedStreamingFileParseResult;
}
