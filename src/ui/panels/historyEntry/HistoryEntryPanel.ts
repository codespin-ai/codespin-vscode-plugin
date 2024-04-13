import {
  UnparsedResult,
  generate as codespinGenerate,
} from "codespin/dist/commands/generate.js";
import * as vscode from "vscode";
import { diffContent } from "../../../git/diffContent.js";
import { getChanges } from "../../../git/getChanges.js";
import { getFullHistoryEntry } from "../../../settings/history/getHistoryEntry.js";
import { getHtmlForCode } from "../../../sourceAnalysis/getHtmlForCode.js";
import { getLangFromFilename } from "../../../sourceAnalysis/getLangFromFilename.js";
import { getWorkspaceRoot } from "../../../vscode/getWorkspaceRoot.js";
import { EventTemplate } from "../../EventTemplate.js";
import { GeneratedSourceFileWithHistory } from "../../viewProviders/history/types.js";
import { UIPanel } from "../UIPanel.js";
import { getGenCommitMessageArgs } from "./getGenCommitMessageArgs.js";
import {
  CommitEvent,
  CommittedEvent,
  GenerateCommitMessageEvent,
  GeneratedCommitMessageEvent,
} from "./types.js";
import { HistoryEntryPageArgs } from "../../html/pages/history/HistoryEntry.js";
import { SelectHistoryEntryArgs } from "../../../commands/history/command.js";
import { commitFiles } from "../../../git/commitFiles.js";

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

      await this.navigateTo("/history/entry", pageArgs);
    }
  }

  async onMessage(message: EventTemplate) {
    switch (message.type) {
      case "generateCommitMessage": {
        const incomingMessage = message as GenerateCommitMessageEvent;
        const generateArgs = await getGenCommitMessageArgs(incomingMessage);
        const result = await codespinGenerate(generateArgs, {
          workingDir: getWorkspaceRoot(this.context),
        });
        const commitMessage = (result as UnparsedResult).text;

        // Post an event back to the page.
        const generatedMessage: GeneratedCommitMessageEvent = {
          type: "generatedCommitMessage",
          message: commitMessage,
        };
        this.postMessageToWebview(generatedMessage);

        break;
      }
      case "commit": {
        const incomingMessage = message as CommitEvent;
        await commitFiles(
          incomingMessage.message,
          getWorkspaceRoot(this.context)
        );
        // Post an event back to the page.
        const committedMessage: CommittedEvent = {
          type: "committed",
        };
        this.postMessageToWebview(committedMessage);
        break;
      }
      case "cancel":
        this.dispose();
        break;
      default:
        console.log("Unhandled message type from webview:", message.type);
        break;
    }
  }
}
