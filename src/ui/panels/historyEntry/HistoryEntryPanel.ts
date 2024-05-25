import { go as codespinGo } from "codespin/dist/commands/go.js";
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
  RegenerateEvent,
} from "./types.js";
import { HistoryEntryPageArgs } from "../../html/pages/history/HistoryEntry.js";
import { SelectHistoryEntryArgs } from "../../../commands/history/command.js";
import { commitFiles } from "../../../git/commitFiles.js";
import { GeneratePanel } from "../generate/GeneratePanel.js";
import { EventEmitter } from "events";
import { navigateTo } from "../../navigateTo.js";

export class HistoryEntryPanel extends UIPanel {
  constructor(
    context: vscode.ExtensionContext,
    globalEventEmitter: EventEmitter
  ) {
    super({}, context, globalEventEmitter);
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

  async onMessage(message: EventTemplate) {
    switch (message.type) {
      case "generateCommitMessage": {
        const incomingMessage = message as GenerateCommitMessageEvent;
        const genCommitMessageArgs = await getGenCommitMessageArgs(
          incomingMessage
        );
        const result = await codespinGo(genCommitMessageArgs, {
          workingDir: getWorkspaceRoot(this.context),
        });
        const commitMessage = result.response;

        // Post an event back to the page.
        const generatedMessage: GeneratedCommitMessageEvent = {
          type: "generatedCommitMessage",
          message: commitMessage,
        };

        this.panel.webview.postMessage(generatedMessage);
        break;
      }
      case "regenerate":
        const event = message as RegenerateEvent;
        const panel = new GeneratePanel(this.context, this.globalEventEmitter);
        await panel.init({ type: "regenerate", args: event.args });
        break;
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
        this.panel.webview.postMessage(committedMessage);
        break;
      }
      case "cancel":
        this.dispose();
        break;
      default:
        break;
    }
  }
}
