import { EventEmitter } from "events";
import * as vscode from "vscode";
import { SelectHistoryEntryArgs } from "../../../commands/history/command.js";
import { diffContent } from "../../../git/diffContent.js";
import { getChanges } from "../../../git/getChanges.js";
import { getFullHistoryEntry } from "../../../settings/history/getHistoryEntry.js";
import { getHtmlForCode } from "../../../sourceAnalysis/getHtmlForCode.js";
import { getLangFromFilename } from "../../../sourceAnalysis/getLangFromFilename.js";
import { getWorkspaceRoot } from "../../../vscode/getWorkspaceRoot.js";
import { HistoryEntryPageArgs } from "../../html/pages/history/entry/HistoryEntry.js";
import { navigateTo } from "../../navigateTo.js";
import { GeneratedSourceFileWithHistory } from "../../viewProviders/history/types.js";
import { UIPanel } from "../UIPanel.js";
import { getMessageBroker } from "./getMessageBroker.js";
import { MessageTemplate } from "../../types.js";

export class HistoryEntryPanel extends UIPanel {
  messageBroker: ReturnType<typeof getMessageBroker>;

  constructor(
    context: vscode.ExtensionContext,
    globalEventEmitter: EventEmitter
  ) {
    super({}, context, globalEventEmitter);
    this.messageBroker = getMessageBroker(this, this.getWebview(), context);
  }

  async init(commandArgs: SelectHistoryEntryArgs) {
    await this.webviewReadyEvent();

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
        filePath: file.path,
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
      ? await Promise.all(historyEntryDetails.files.map(formatFileContent))
      : [];

    if (historyEntryDetails && files) {
      // Populate the pageArgs with the entry details and the formattedFiles object
      const pageArgs: HistoryEntryPageArgs = {
        entry: historyEntryDetails,
        files,
        git: {
          files: await getChanges(workspaceRoot),
        },
      };

      await navigateTo(this, "/history/entry", pageArgs);
    }
  }

  async onMessage(message: MessageTemplate) {
    if (this.messageBroker.canHandle(message.type)) {
      this.messageBroker.handleRequest(message as any);
    }
  }
}
