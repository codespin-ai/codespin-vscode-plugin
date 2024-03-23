import * as React from "react";
import { useState } from "react";
import {
  VSCodeButton,
  VSCodeDropdown,
  VSCodeOption,
  VSCodeTextField,
} from "@vscode/webview-ui-toolkit/react/index.js";
import { getVsCodeApi } from "../../../vscode/getVsCodeApi.js";
import { CSFormField } from "../../components/CSFormField.js";
import { EventTemplate } from "../../../EventTemplate.js";
import { EditProviderConfigArgs } from "../../../commands/EditProviderConfigArgs.js";

interface EditOpenAIConfigProps {
  vendor: string;
  apiKey: string;
  completionsEndPoint: string;
}

export function EditOpenAIConfig(props: EditOpenAIConfigProps) {
  const vsCodeApi = getVsCodeApi();

  const [vendor, setVendor] = useState<string>(props.vendor ?? "");
  const [apiKey, setApiKey] = useState<string>(props.apiKey ?? "");
  const [completionsEndPoint, setCompletionsEndPoint] = useState<string>(
    props.completionsEndPoint ?? ""
  );

  function handleSave() {
    const message: EventTemplate<EditProviderConfigArgs> = {
      type: "provider:editConfig",
      provider: "openai",
      vendor,
      apiKey,
      completionsEndPoint: vendor === "azure" ? completionsEndPoint : undefined,
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
          $HOME/.codespin/openai.json
        </p>
      ) : (
        <></>
      )}
      <CSFormField label={{ text: "API Vendor:" }}>
        <VSCodeDropdown
          value={vendor}
          onChange={(e: any) => setVendor(e.target.value)}
        >
          <VSCodeOption value="openai">Open AI</VSCodeOption>
          <VSCodeOption value="azure">Azure</VSCodeOption>
        </VSCodeDropdown>
      </CSFormField>
      <CSFormField label={{ text: "API Key:" }}>
        <VSCodeTextField
          value={apiKey}
          onChange={(e: any) => setApiKey(e.target.value)}
        />
      </CSFormField>
      {vendor === "azure" && (
        <CSFormField label={{ text: "Completions Endpoint:" }}>
          <VSCodeTextField
            value={completionsEndPoint}
            onChange={(e: any) => setCompletionsEndPoint(e.target.value)}
          />
        </CSFormField>
      )}
      <CSFormField>
        <VSCodeButton onClick={handleSave}>Proceed</VSCodeButton>
      </CSFormField>
    </div>
  );
}
