import * as React from "react";
import { useEffect, useState } from "react";
import { getVSCodeApi } from "../../../../../vscode/getVSCodeApi.js";
import { GenerateUserInput } from "../../../../panels/generate/types.js";
import {
  CommitEvent,
  GenerateCommitMessageEvent,
  RegenerateEvent,
} from "../../../../panels/historyEntry/types.js";
import { BrowserEvent, CancelEvent } from "../../../../types.js";
import { FullHistoryEntry } from "../../../../viewProviders/history/types.js";
import { CodeSnippet } from "../../../components/CodeSnippet.js";
import { getMessageBroker } from "./getMessageBroker.js";
import { createMessageClient } from "../../../../../messaging/messageClient.js";
import { HistoryEntryPanelBrokerType } from "../../../../panels/historyEntry/getMessageBroker.js";

export type HistoryEntryPageFile = {
  filePath: string;
  original: string | undefined;
  generated: string;
  originalHtml: string | undefined;
  generatedHtml: string;
  diffHtml: string;
};

export type HistoryEntryPageArgs = {
  entry: FullHistoryEntry;
  files: HistoryEntryPageFile[];
  git: {
    files: GitFileChange[];
  };
};

export function HistoryEntry() {
  const args: HistoryEntryPageArgs = history.state;
  const [activeTab, setActiveTab] = useState("prompt");
  const [commitMessage, setCommitMessage] = useState<string>("");
  const [showCommitMessage, setShowCommitMessage] = useState<boolean>(false);
  const [isCommitted, setIsCommitted] = useState<boolean>(false);

  const gatherArgsForRegenerateCommand = (): GenerateUserInput => {
    const { userInput } = args.entry;

    const codegenUserInput: GenerateUserInput = {
      model: userInput.model,
      prompt: args.entry.prompt,
      codingConvention: userInput.codingConvention,
      includedFiles: userInput.includedFiles,
    };

    return codegenUserInput;
  };

  const historyEntryPanelMessageClient =
    createMessageClient<HistoryEntryPanelBrokerType>((message: unknown) => {
      getVSCodeApi().postMessage(message);
    });

  const onEditClick = () => {
    const regenerateEvent: RegenerateEvent = {
      type: "regenerate",
      args: gatherArgsForRegenerateCommand(),
    };

    historyEntryPanelMessageClient.send("regenerate", regenerateEvent);

    const cancelEvent: CancelEvent = {
      type: "cancel",
    };

    historyEntryPanelMessageClient.send("cancel", cancelEvent);
  };

  const onGenerateCommitMessage = () => {
    const message: GenerateCommitMessageEvent = {
      type: "generateCommitMessage",
      prompt: args.entry.userInput.prompt,
      model: args.entry.userInput.model,
    };

    historyEntryPanelMessageClient.send("generateCommitMessage", message);
  };

  const onCommitClick = () => {
    const message: CommitEvent = {
      type: "commit",
      message: commitMessage,
    };

    historyEntryPanelMessageClient.send("commit", message);
  };

  useEffect(() => {
    const historyEntryPageMessageBroker = getMessageBroker({
      setCommitMessage,
      setShowCommitMessage,
      setIsCommitted,
    });

    function listener(event: BrowserEvent) {
      const message = event.data;
      if (historyEntryPageMessageBroker.canHandle(message.type)) {
        historyEntryPageMessageBroker.handleRequest(message as any);
      }
    }

    window.addEventListener("message", listener);

    return () => {
      window.removeEventListener("message", listener);
    };
  }, []);

  const tabs = [
    { id: "prompt", label: "PROMPT" },
    { id: "raw", label: "RAW" },
    { id: "diff", label: "DIFF" },
    { id: "commit", label: "COMMIT" },
  ];

  return (
    <div className="bg-vscode-editor-background min-h-screen text-vscode-editor-foreground">
      {/* Tab Navigation */}
      <div className="border-b border-vscode-panel-border">
        <div className="flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 font-medium focus:outline-none 
                ${
                  activeTab === tab.id
                    ? "border-b-2 border-vscode-button-background text-vscode-button-background"
                    : "text-vscode-editor-foreground hover:text-vscode-button-foreground"
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {/* PROMPT Tab */}
        {activeTab === "prompt" && (
          <div className="space-y-6">
            <div className="rounded p-4 bg-vscode-input-background border border-vscode-input-border max-w-3xl ">
              <pre className="font-vscode-editor whitespace-pre-wrap m-0">
                {args.entry.prompt}
              </pre>
            </div>

            <button
              onClick={onEditClick}
              className="px-4 py-2 bg-vscode-button-background text-vscode-button-foreground 
                       rounded-md hover:bg-vscode-button-hover-background 
                       focus:outline-none focus:ring-2 focus:ring-vscode-focusBorder"
            >
              Edit Prompt
            </button>

            <h2 className="text-lg font-medium mt-6">Generated Files</h2>
            <div className="space-y-4">
              {args.files.length ? (
                args.files.map((file) => (
                  <CodeSnippet
                    key={file.filePath}
                    filePath={file.filePath}
                    code={file.generatedHtml}
                    codeHtml={file.generatedHtml}
                  />
                ))
              ) : (
                <div>No files were generated.</div>
              )}
            </div>
          </div>
        )}

        {/* RAW Tab */}
        {activeTab === "raw" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Prompt</h3>
              <div className="rounded p-4 bg-vscode-input-background border border-vscode-input-border">
                <pre className="font-vscode-editor whitespace-pre-wrap">
                  {args.entry.rawPrompt}
                </pre>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-2">Response</h3>
              <div className="rounded p-4 bg-vscode-input-background border border-vscode-input-border">
                <pre className="font-vscode-editor whitespace-pre-wrap">
                  {args.entry.rawResponse}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* DIFF Tab */}
        {activeTab === "diff" && (
          <div>
            {args.files.length ? (
              args.files.map((file) => (
                <div key={file.filePath} className="mb-6">
                  <h3 className="text-lg font-medium mb-2">
                    Diff: {file.filePath}
                  </h3>
                  <div className="rounded p-4 bg-vscode-input-background border border-vscode-input-border">
                    <pre className="font-vscode-editor whitespace-pre-wrap">
                      {file.diffHtml}
                    </pre>
                  </div>
                </div>
              ))
            ) : (
              <div>No files were generated.</div>
            )}
          </div>
        )}

        {/* COMMIT Tab */}
        {activeTab === "commit" && (
          <div className="space-y-6">
            {args.git.files.length ? (
              <>
                <div className="rounded p-4 bg-vscode-input-background border border-vscode-input-border">
                  <pre className="font-vscode-editor whitespace-pre-wrap">
                    {args.entry.prompt}
                  </pre>
                </div>

                {!showCommitMessage && (
                  <button
                    onClick={onGenerateCommitMessage}
                    className="px-4 py-2 bg-vscode-button-background text-vscode-button-foreground 
                             rounded-md hover:bg-vscode-button-hover-background 
                             focus:outline-none focus:ring-2 focus:ring-vscode-focusBorder"
                  >
                    Generate Commit Message
                  </button>
                )}

                {showCommitMessage && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">
                      Generated Commit Message
                    </h3>
                    <div className="rounded p-4 bg-vscode-input-background border border-vscode-input-border">
                      <pre className="font-vscode-editor whitespace-pre-wrap">
                        {commitMessage}
                      </pre>
                    </div>

                    {!isCommitted && (
                      <button
                        onClick={onCommitClick}
                        className="px-4 py-2 bg-vscode-button-background text-vscode-button-foreground 
                                 rounded-md hover:bg-vscode-button-hover-background 
                                 focus:outline-none focus:ring-2 focus:ring-vscode-focusBorder"
                      >
                        Commit Files
                      </button>
                    )}
                  </div>
                )}

                <div>
                  <h3 className="text-lg font-medium mb-2">
                    {isCommitted
                      ? "✅ The following files were committed"
                      : "Files in commit:"}
                  </h3>
                  <ul className="space-y-1">
                    {args.git.files.map((file, i) => (
                      <li key={file.filePath} className="font-vscode-editor">
                        {i + 1}. {file.filePath} ({file.change})
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            ) : (
              <div>There are no files to be committed.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
