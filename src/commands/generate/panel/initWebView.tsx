import { WebviewApi } from "vscode-webview";
import { createRoot } from "react-dom/client";
import * as React from "react";
import { useEffect, useState } from "react";
import { CSDropDown } from "../../../components/CSDropDown.js";
import { CSTextArea } from "../../../components/CSTextAreaRow.js";
import { CSFormField } from "../../../components/CSFormField.js";
import {
  VSCodeButton,
  VSCodeDivider,
} from "@vscode/webview-ui-toolkit/react/index.js";
import { formatFileSize } from "../../../text/formatFileSize.js";

let vsCodeApi: WebviewApi<unknown>;

function GeneratePanelContainer() {
  const [state, setState] = useState<GenerateArgs>({
    models: [],
    files: [],
    rules: [],
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
          });
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
          dropdownStyle={{ width: "180px" }}
        />
      </CSFormField>
      <CSFormField label={{ text: "Prompt:" }}>
        <CSTextArea
          rows={10}
          cols={50}
          textareaStyle={{ fontFamily: "var(--vscode-editor-font-family)" }}
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
            state.files.map((x) => ({ text: x.path, value: x.path }))
          )}
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
          dropdownStyle={{ width: "180px" }}
        />{" "}
      </CSFormField>
      <CSFormField label={{ text: "Included Files:" }}>
        {state.files.map((file) => (
          <div
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

export function initWebView() {
  function onReady() {
    const domRootNode = document.getElementById("root")!;
    const root = createRoot(domRootNode);
    root.render(<GeneratePanelContainer />);
  }

  if (document.readyState === "complete") {
    onReady();
  } else {
    window.addEventListener("DOMContentLoaded", onReady);
  }
}
