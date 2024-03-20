import { WebviewApi } from "vscode-webview";
import * as React from "react";
import { useEffect, useState } from "react";
import { CSDropDown } from "../components/CSDropDown.js";
import { CSTextArea } from "../components/CSTextAreaRow.js";
import { CSFormField } from "../components/CSFormField.js";
import {
  VSCodeButton,
  VSCodeDivider,
} from "@vscode/webview-ui-toolkit/react/index.js";
import { formatFileSize } from "../../text/formatFileSize.js";

let vsCodeApi: WebviewApi<unknown>;

export function Generate() {
  const [state, setState] = useState<GenerateArgs>({
    models: [],
    files: [],
    rules: [],
    selectedModel: "",
  });

  useEffect(() => {
    window.addEventListener("message", (event) => {
      const message = event.data;
      switch (message.command) {
        case "load":
          setState({
            models: message.models,
            files: message.files,
            rules: message.rules,
            selectedModel: message.selectedModel,
          });
          console.log(message);
          break;
      }
    });
    vsCodeApi = acquireVsCodeApi();
    vsCodeApi.postMessage({ command: "webviewReady" });
  }, []);

  return (
    <div>
      <h1>Generate</h1>
      <CSFormField label={{ text: "Model" }}>
        <CSDropDown
          items={state.models.map((x) => ({ text: x.name, value: x.value }))}
          selectedItem={state.selectedModel}
          dropdownStyle={{ width: "180px" }}
        />
      </CSFormField>
      <CSFormField label={{ text: "Prompt:" }}>
        <CSTextArea
          rows={10}
          cols={50}
          textareaStyle={{ fontFamily: "var(--vscode-editor-font-family)" }}
          resize="both"
        />{" "}
      </CSFormField>
      <CSFormField>
        <VSCodeButton>Generate Code</VSCodeButton>
      </CSFormField>
      <VSCodeDivider />
      <h3>Additional Options</h3>
      <CSFormField label={{ text: "Files to generate:" }}>
        <CSDropDown
          items={[{ text: "As in Prompt", value: ":prompt" }].concat(
            state.files.map((x) => ({
              text: x.path,
              value: `${x.path}`,
            }))
          )}
          selectedItem="prompt"
          dropdownStyle={{ width: "180px" }}
        />{" "}
      </CSFormField>
      <CSFormField label={{ text: "Coding Conventions:" }}>
        <CSDropDown
          items={state.rules.map((x) => ({ text: x, value: x }))}
          dropdownStyle={{ width: "180px" }}
        />{" "}
      </CSFormField>
      <CSFormField label={{ text: "File Version:" }}>
        <CSDropDown
          items={[
            { text: "Working Copy", value: "working-copy" },
            { text: "Git HEAD", value: "head" },
          ]}
          selectedItem="working-copy"
          dropdownStyle={{ width: "180px" }}
        />{" "}
      </CSFormField>
      <CSFormField label={{ text: "Included Files:" }}>
        {state.files.map((file) => (
          <div
            key={file.path}
            style={{
              marginBottom: "4px",
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <CSDropDown
              items={[
                { text: "Full Source", value: "source" },
                { text: "Declarations", value: "declarations" },
              ]}
              dropdownStyle={{ width: "120px", marginRight: "8px" }}
            />
            <span>
              {file.path} {file.size ? `(${formatFileSize(file.size)})` : ""}
            </span>
            <br />
          </div>
        ))}{" "}
      </CSFormField>
    </div>
  );
}
