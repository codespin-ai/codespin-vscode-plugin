import { component } from "bloom-router";
import { getVSCodeApi } from "../../../../../vscode/getVSCodeApi.js";
import { MessageTemplate } from "../../../../types.js";

export async function* InitializePage() {
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
        <vscode-button onclick={initializeProject}>
          Initialize Project
        </vscode-button>
      </div>
    </div>
  );
}

component("initialize-page", InitializePage);
