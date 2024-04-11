import { Dropdown } from "@vscode/webview-ui-toolkit";
import {
  VSCodeButton,
  VSCodeTextField,
} from "@vscode/webview-ui-toolkit/react/index.js";
import * as React from "react";
import { useState } from "react";
import { EditOpenAIConfigEvent } from "../../../../settings/api/types.js";
import { getVSCodeApi } from "../../../../vscode/getVSCodeApi.js";
import { CSFormField } from "../../components/CSFormField.js";
import { OpenAIConfigArgs } from "../../../../settings/api/editOpenAIConfig.js";

export function EditOpenAIConfig(props: OpenAIConfigArgs) {
  const vsCodeApi = getVSCodeApi();
  const [apiKey, setApiKey] = useState<string>(props.apiKey ?? "");

  function onSave() {
    const message: EditOpenAIConfigEvent = {
      type: "editOpenAIConfig",
      apiKey,
    };
    vsCodeApi.postMessage(message);
  }

  return (
    <div>
      {apiKey === "" ? (
        <h1>Configure OpenAI Keys</h1>
      ) : (
        <h1>OpenAI API Config</h1>
      )}
      {apiKey === "" ? (
        <p>
          You need to set up OpenAI API keys. This will be stored in
          .codespin/openai.json
        </p>
      ) : (
        <></>
      )}
      <CSFormField label={{ text: "API Key:" }}>
        <VSCodeTextField
          value={apiKey}
          onChange={(e: React.ChangeEvent<Dropdown>) =>
            setApiKey(e.target.value)
          }
        />
      </CSFormField>
      <CSFormField>
        <VSCodeButton onClick={onSave}>Proceed</VSCodeButton>
      </CSFormField>
    </div>
  );
}
