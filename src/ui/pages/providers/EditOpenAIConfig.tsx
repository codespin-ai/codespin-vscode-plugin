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

// Define a TypeScript interface for the component's props
interface EditOpenAIConfigProps {
  vendor: string;
  apiKey: string;
  completionsEndPoint: string;
}

// Update the component to accept props and use them to initialize state
export function EditOpenAIConfig(props: EditOpenAIConfigProps) {
  const vsCodeApi = getVsCodeApi();
  // Initialize state with props
  const [vendor, setVendor] = useState<string>(props.vendor ?? "");
  const [apiKey, setApiKey] = useState<string>(props.apiKey ?? "");
  const [completionsEndPoint, setCompletionsEndPoint] = useState<string>(
    props.completionsEndPoint ?? ""
  );

  function handleSave() {
    const message = {
      type: "saveConfig",
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
