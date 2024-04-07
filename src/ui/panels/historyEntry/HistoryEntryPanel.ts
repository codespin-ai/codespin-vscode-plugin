import { GeneratedSourceFile } from "codespin/dist/sourceCode/GeneratedSourceFile.js";
import * as vscode from "vscode";
import { UIPanel } from "../UIPanel.js";
import { getWorkspaceRoot } from "../../../vscode/getWorkspaceRoot.js";
import { getFullHistoryEntry } from "../../../settings/history/getHistoryEntry.js";
import { getLangFromFilename } from "../../../sourceAnalysis/getLangFromFilename.js";
import { getHtmlForCode } from "../../../sourceAnalysis/getHtmlForCode.js";
import { HistoryEntryPageArgs } from "../../html/pages/history/HistoryEntryPageArgs.js";
import { EventTemplate } from "../../EventTemplate.js";
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
    async function formatFileContent(file: GeneratedSourceFile) {
      const originalHtml = file.original
        ? await getHtmlForCode(file.original, getLangFromFilename(file.path))
        : undefined;
      const generatedHtml = await getHtmlForCode(
        file.generated,
        getLangFromFilename(file.path)
      );
      return {
        path: file.path,
        original: originalHtml,
        generated: generatedHtml,
      };
    }

    const formattedFilesObject = historyEntryDetails
      ? await (async () => {
          // Map each file to a Promise of its formatted content, then resolve all promises concurrently
          const formattedFilesPromises =
            historyEntryDetails.files.map(formatFileContent);

          // Use Promise.all to wait for all formatting operations to complete
          const formattedFilesArray = await Promise.all(formattedFilesPromises);

          // Convert the array of formatted file objects into an Object
          return formattedFilesArray.reduce(
            (acc, file) => {
              acc[file.path] = {
                original: file.original,
                generated: file.generated,
              };
              return acc;
            },
            {} as {
              [key: string]: {
                original: string | undefined;
                generated: string;
              };
            }
          );
        })()
      : null;

    if (historyEntryDetails && formattedFilesObject) {
      // Populate the pageArgs with the entry details and the formattedFiles object
      const pageArgs: HistoryEntryPageArgs = {
        entry: historyEntryDetails,
        formattedFiles: formattedFilesObject,
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
