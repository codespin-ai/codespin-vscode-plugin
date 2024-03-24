import * as React from "react";
import { useState } from "react";
import {
  VSCodeButton,
  VSCodeTextField,
} from "@vscode/webview-ui-toolkit/react/index.js";
import { CSFormField } from "../../components/CSFormField.js";
import { getVsCodeApi } from "../../../vscode/getVsCodeApi.js";
import { EditAPIConfigArgs } from "../../../commands/EditAPIConfigArgs.js";
import { EventTemplate } from "../../../EventTemplate.js";

type EditAnthropicConfigProps = {
  apiKey: string;
};

export function EditAnthropicConfig(props: EditAnthropicConfigProps) {
  const vsCodeApi = getVsCodeApi();
  const [apiKey, setApiKey] = useState<string>(props.apiKey ?? "");

  function handleSave() {
    const message: EventTemplate<EditAPIConfigArgs> = {
      type: "provider:editConfig",
      api: "anthropic",
      apiKey,
    };
    vsCodeApi.postMessage(message);
  }

  return (
    <div>
      {!props.apiKey ? (
        <h1>Configure Anthropic Keys</h1>
      ) : (
        <h1>Anthropic API Config</h1>
      )}
      {!props.apiKey ? (
        <p>
          You need to set up OpenAI API keys. This will be stored in
          .codespin/anthropic.json
        </p>
      ) : (
        <></>
      )}
      <CSFormField label={{ text: "API Key:" }}>
        <VSCodeTextField
          value={apiKey}
          onChange={(e: any) => setApiKey(e.target.value)}
        />
      </CSFormField>
      <CSFormField>
        <VSCodeButton onClick={handleSave}>Save</VSCodeButton>
      </CSFormField>
    </div>
  );
}
