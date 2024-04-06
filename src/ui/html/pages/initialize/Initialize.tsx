import { VSCodeButton } from "@vscode/webview-ui-toolkit/react/index.js";
import * as React from "react";
import { EventTemplate } from "../../../EventTemplate.js";
import { getVsCodeApi } from "../../../../vscode/getVsCodeApi.js";

export function Initialize() {
  const vsCodeApi = getVsCodeApi();

  function initializeProject() {
    const message: EventTemplate<{}> = {
      type: "initialize",
    };
    vsCodeApi.postMessage(message);
  }

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          flexDirection: "column",
        }}
      >
        <p>Codespin needs to be initialized for this project.</p>
        <VSCodeButton onClick={initializeProject}>
          Initialize Project
        </VSCodeButton>
      </div>
    </div>
  );
}
