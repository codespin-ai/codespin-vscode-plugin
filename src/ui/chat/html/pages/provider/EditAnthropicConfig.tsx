import {
  VSCodeButton,
  VSCodeTextField,
} from "@vscode/webview-ui-toolkit/react/index.js";
import * as React from "react";
import { useState } from "react";
import { CSFormField } from "../../components/CSFormField.js";
import { getVSCodeApi } from "../../../../../vscode/getVSCodeApi.js";
import { AnthropicConfigArgs } from "../../../../../settings/provider/editAnthropicConfig.js";
import { EditAnthropicConfigEvent } from "../../../../../settings/provider/types.js";

export function EditAnthropicConfig(props: AnthropicConfigArgs) {
  const vsCodeApi = getVSCodeApi();
  const [apiKey, setApiKey] = useState<string>(props.apiKey ?? "");

  function onSave() {
    const message: EditAnthropicConfigEvent = {
      type: "editAnthropicConfig",
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
          onChange={(e: unknown) => setApiKey((e as any).target.value)}
        />
      </CSFormField>
      <CSFormField>
        <VSCodeButton onClick={onSave}>Save</VSCodeButton>
      </CSFormField>
    </div>
  );
}
