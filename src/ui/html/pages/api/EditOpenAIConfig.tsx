import {
  VSCodeButton,
  VSCodeTextField,
} from "@vscode/webview-ui-toolkit/react/index.js";
import * as React from "react";
import { useState } from "react";
import { CSFormField } from "../../components/CSFormField.js";
import { getVsCodeApi } from "../../../../vscode/getVsCodeApi.js";
import { EventTemplate } from "../../../EventTemplate.js";
import { OpenAIConfigArgs } from "../../../../settings/api/editOpenAIConfig.js";

interface EditOpenAIConfigProps {
  apiKey: string;
}

export function EditOpenAIConfig(props: EditOpenAIConfigProps) {
  const vsCodeApi = getVsCodeApi();
  const [apiKey, setApiKey] = useState<string>(props.apiKey ?? "");

  function onSave() {
    const message: EventTemplate<OpenAIConfigArgs> = {
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
          onChange={(e: any) => setApiKey(e.target.value)}
        />
      </CSFormField>
      <CSFormField>
        <VSCodeButton onClick={onSave}>Proceed</VSCodeButton>
      </CSFormField>
    </div>
  );
}
