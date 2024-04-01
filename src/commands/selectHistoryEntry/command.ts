import { GeneratedSourceFile } from "codespin/dist/sourceCode/GeneratedSourceFile.js";
import * as vscode from "vscode";
import { getFullHistoryEntry } from "../../settings/history/getHistoryEntry.js";
import { getHtmlForCode } from "../../sourceAnalysis/getHtmlForCode.js";
import { getLangFromFilename } from "../../sourceAnalysis/getLangFromFilename.js";
import { UIPanel } from "../../ui/UIPanel.js";
import { HistoryEntryPageArgs } from "../../ui/pages/history/HistoryEntryPageArgs.js";
import { getWorkspaceRoot } from "../../vscode/getWorkspaceRoot.js";
import { SelectHistoryEntryArgs } from "./SelectHistoryEntryArgs.js";

export function getSelectHistoryEntryCommand(context: vscode.ExtensionContext) {
  return async function selectHistoryItemCommand(
    args: SelectHistoryEntryArgs
  ): Promise<void> {
    if (!args.itemId) {
      vscode.window.showErrorMessage("No history item ID provided.");
      return;
    }

    const uiPanel = new UIPanel(context, onMessage);
    await uiPanel.onWebviewReady();

    const workspaceRoot = await getWorkspaceRoot(context);
    const historyEntryDetails = await getFullHistoryEntry(
      args.itemId,
      workspaceRoot
    );

    // Function to asynchronously transform a single file's content to its HTML representation
    async function formatFileContent(file: GeneratedSourceFile) {
      const originalHtml = await getHtmlForCode(
        file.original,
        getLangFromFilename(file.path)
      );
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
              [key: string]: { original: string; generated: string };
            }
          );
        })()
      : null;

    // Populate the pageArgs with the entry details and the formattedFiles object
    const pageArgs: HistoryEntryPageArgs = {
      entry: historyEntryDetails,
      formattedFiles: formattedFilesObject,
    };

    await uiPanel.navigateTo("/history/entry", pageArgs);

    async function onMessage(message: any) {
      switch (message.type) {
        case "historyItemAction":
          break;
        default:
          console.log("Unhandled message type from webview:", message.type);
          break;
      }
    }
  };
}
