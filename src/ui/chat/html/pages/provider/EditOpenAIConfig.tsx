import * as React from "react";
import { useState } from "react";
import { OpenAIConfigArgs } from "../../../../../settings/provider/editOpenAIConfig.js";
import { getVSCodeApi } from "../../../../../vscode/getVSCodeApi.js";
import { EditOpenAIConfigEvent } from "../../../../../settings/provider/types.js";
import { createMessageClient } from "../../../../../messaging/messageClient.js";
import { ChatPanelBrokerType } from "../../../getMessageBroker.js";
import type { ConfigPageState } from "./EditConfig.js";

export function EditOpenAIConfig(props: OpenAIConfigArgs) {
  const [apiKey, setApiKey] = useState<string>(props.apiKey ?? "");
  const state: ConfigPageState = history.state;

  function onSave() {
    const chatPanelMessageClient = createMessageClient<ChatPanelBrokerType>(
      (message: unknown) => {
        getVSCodeApi().postMessage(message);
      }
    );

    const message: EditOpenAIConfigEvent = {
      type: "editOpenAIConfig",
      apiKey,
      startChatUserInput: state.startChatUserInput,
    };

    chatPanelMessageClient.send("editOpenAIConfig", message);
  }

  return (
    <div className="min-h-screen bg-vscode-editor-background p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-vscode-editor-foreground mb-2">
            {apiKey === "" ? "Configure OpenAI API" : "OpenAI API Settings"}
          </h1>
          {apiKey === "" && (
            <p className="text-vscode-editor-foreground opacity-80 text-sm">
              Set up your OpenAI API key to get started. Your key will be
              securely stored in .codespin/openai.json
            </p>
          )}
          {
            <p className="text-vscode-editor-foreground opacity-80 text-sm mt-2">
              After saving, you'll return to your previous chat.
            </p>
          }
        </div>

        <div className="space-y-6 bg-vscode-input-background rounded-lg p-6 shadow-sm border border-vscode-panel-border">
          <div className="space-y-2">
            <label
              htmlFor="api-key"
              className="block text-sm font-medium text-vscode-editor-foreground"
            >
              API Key
            </label>
            <input
              id="api-key"
              type="text"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your OpenAI API key"
              className="w-full px-3 py-2 bg-vscode-input-background border border-vscode-input-border rounded text-vscode-input-foreground placeholder-vscode-input-placeholder focus:outline-none focus:ring-2 focus:ring-vscode-focusBorder"
            />
          </div>

          <div className="pt-4">
            <button
              onClick={onSave}
              className="min-w-[120px] px-4 py-2 bg-vscode-button-background text-vscode-button-foreground rounded font-medium hover:bg-vscode-button-hover-background focus:outline-none focus:ring-2 focus:ring-vscode-focusBorder transition-colors duration-200"
            >
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
