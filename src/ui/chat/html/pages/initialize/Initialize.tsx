import { VSCodeButton } from "@vscode/webview-ui-toolkit/react/index.js";
import * as React from "react";
import { getVSCodeApi } from "../../../../../vscode/getVSCodeApi.js";
import { MessageTemplate } from "../../../../types.js";

export function Initialize() {
  const vsCodeApi = getVSCodeApi();

  function initializeProject() {
    const message: MessageTemplate<"initialize"> = {
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
        <p>CodeSpin needs to be initialized for this project.</p>
        <VSCodeButton onClick={initializeProject}>
          Initialize Project
        </VSCodeButton>
      </div>
    </div>
  );
}
