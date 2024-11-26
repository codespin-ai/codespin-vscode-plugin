import { go as codespinGo } from "codespin/dist/commands/go.js";
import { EventEmitter } from "stream";
import * as vscode from "vscode";
import { commitFiles } from "../../../git/commitFiles.js";
import { BrokerType, createMessageBroker } from "../../../messaging/messageBroker.js";
import { createMessageClient } from "../../../messaging/messageClient.js";
import { getWorkspaceRoot } from "../../../vscode/getWorkspaceRoot.js";
import { HistoryEntryPageBrokerType } from "../../html/pages/history/entry/getMessageBroker.js";
import { GeneratePanel } from "../generate/GeneratePanel.js";
import { UIPanel } from "../UIPanel.js";
import { getGenCommitMessageArgs } from "./getGenCommitMessageArgs.js";
import {
  CommitEvent,
  CommittedEvent,
  GenerateCommitMessageEvent,
  GeneratedCommitMessageEvent,
  RegenerateEvent,
} from "./types.js";

export function getMessageBroker(
  parentPanel: UIPanel,
  historyEntryWebview: vscode.Webview,
  context: vscode.ExtensionContext
) {
  const messageBroker = createMessageBroker()
    .attachHandler(
      "generateCommitMessage",
      async (message: GenerateCommitMessageEvent) => {
        const incomingMessage = message as GenerateCommitMessageEvent;
        const genCommitMessageArgs = await getGenCommitMessageArgs(
          incomingMessage
        );
        const result = await codespinGo(genCommitMessageArgs, {
          workingDir: getWorkspaceRoot(context),
        });
        const commitMessage = result.response;

        const historyEntryPageMessageClient =
          createMessageClient<HistoryEntryPageBrokerType>(
            (message: unknown) => {
              historyEntryWebview.postMessage(message);
            }
          );

        // Post an event back to the page.
        const generatedMessage: GeneratedCommitMessageEvent = {
          type: "generatedCommitMessage",
          message: commitMessage,
        };

        historyEntryPageMessageClient.send(
          "generatedCommitMessage",
          generatedMessage
        );
      }
    )
    .attachHandler("regenerate", async (message: RegenerateEvent) => {
      const generatePanel = new GeneratePanel(
        context,
        parentPanel.globalEventEmitter
      );
      await generatePanel.init({ type: "regenerate", args: message.args });
    })
    .attachHandler("commit", async (message: CommitEvent) => {
      await commitFiles(message.message, getWorkspaceRoot(context));
      // Post an event back to the page.
      const committedMessage: CommittedEvent = {
        type: "committed",
      };

      const historyEntryPageMessageClient =
        createMessageClient<HistoryEntryPageBrokerType>((message: unknown) => {
          historyEntryWebview.postMessage(message);
        });

      historyEntryPageMessageClient.send("committed", committedMessage);
    })
    .attachHandler("cancel", async () => {
      parentPanel.dispose();
    });

  return messageBroker;
}

export type HistoryEntryViewBrokerType = BrokerType<typeof getMessageBroker>;
