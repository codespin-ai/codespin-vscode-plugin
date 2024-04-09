import * as vscode from "vscode";
import { diffContent } from "../../../git/diffContent.js";
import { getFullHistoryEntry } from "../../../settings/history/getHistoryEntry.js";
import { getHtmlForCode } from "../../../sourceAnalysis/getHtmlForCode.js";
import { getLangFromFilename } from "../../../sourceAnalysis/getLangFromFilename.js";
import { getWorkspaceRoot } from "../../../vscode/getWorkspaceRoot.js";
import { EventTemplate } from "../../EventTemplate.js";
import { HistoryEntryPageArgs } from "../../html/pages/history/HistoryEntryPageArgs.js";
import { GeneratedSourceFileWithHistory } from "../../viewProviders/history/types.js";
import { UIPanel } from "../UIPanel.js";
import { SelectHistoryEntryArgs } from "./eventArgs.js";

export class HistoryEntryPanel extends UIPanel {
  constructor(context: vscode.ExtensionContext) {
    super(context);
  }

  async init(commandArgs: SelectHistoryEntryArgs) {
    await this.onWebviewReady();

    const workspaceRoot = await getWorkspaceRoot(this.context);

    const historyEntryDetails = await getFullHistoryEntry(
      commandArgs.itemId,
      workspaceRoot
    );

    // Function to asynchronously transform a single file's content to its HTML representation
    const formatFileContent = async (file: GeneratedSourceFileWithHistory) => {
      const originalHtml = file.original
        ? await getHtmlForCode(file.original, getLangFromFilename(file.path))
        : undefined;
      const generatedHtml = await getHtmlForCode(
        file.generated,
        getLangFromFilename(file.path)
      );
      return {
        path: file.path,
        original: file.original,
        generated: file.generated,
        originalHtml: originalHtml,
        generatedHtml: generatedHtml,
        diffHtml: await diffContent(
          file.history.originalFilePath,
          file.history.generatedFilePath,
          getWorkspaceRoot(this.context)
        ),
      };
    };

    const files = historyEntryDetails
      ? await (async () => {
          // Map each file to a Promise of its formatted content, then resolve all promises concurrently
          const formattedFilesPromises =
            historyEntryDetails.files.map(formatFileContent);

          // Use Promise.all to wait for all formatting operations to complete
          const formattedFilesArray = await Promise.all(formattedFilesPromises);

          // Convert the array of formatted file objects into an Object
          return formattedFilesArray.reduce(async (accP, file) => {
            const acc = await accP;
            acc[file.path] = {
              original: file.originalHtml,
              generated: file.generatedHtml,
              diffHtml: file.diffHtml,
            };
            return acc;
          }, Promise.resolve({} as HistoryEntryPageArgs["files"]));
        })()
      : null;

    if (historyEntryDetails && files) {
      // Populate the pageArgs with the entry details and the formattedFiles object
      const pageArgs: HistoryEntryPageArgs = {
        entry: historyEntryDetails,
        files,
      };

      await this.navigateTo("/history/entry", pageArgs);
    }
  }

  async onMessage(message: EventTemplate<unknown>) {
    switch (message.type) {
      case "cancel":
        this.dispose();
        break;
      default:
        console.log("Unhandled message type from webview:", message.type);
        break;
    }
  }
}
