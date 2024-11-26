import {
  VSCodeButton,
  VSCodeDivider,
  VSCodeProgressRing,
} from "@vscode/webview-ui-toolkit/react/index.js";
import * as React from "react";
import { createMessageClient } from "../../../../../messaging/messageClient.js";
import { getVSCodeApi } from "../../../../../vscode/getVSCodeApi.js";
import { GeneratePanelBrokerType } from "../../../../panels/generate/getMessageBroker.js";
import { CSFormField } from "../../../components/CSFormField.js";
import { getMessageBroker } from "./getMessageBroker.js";
import { BrowserEvent, MessageTemplate } from "../../../../types.js";

type GenerateStreamArgs = {
  provider: string;
  model: string;
};

export function Chat() {
  const args: GenerateStreamArgs = history.state;

  const [bytesReceived, setBytesReceived] = React.useState(0);
  let [data, setData] = React.useState("");
  const [prompt, setPrompt] = React.useState("");

  React.useEffect(() => {
    const pageMessageBroker = getMessageBroker({
      setPrompt,
      setData,
      setBytesReceived,
    });

    function listeners(event: BrowserEvent) {
      const message = event.data;

      if (pageMessageBroker.canHandle(message.type)) {
        pageMessageBroker.handleRequest(message as any);
      }
    }

    window.addEventListener("message", listeners);

    getVSCodeApi().postMessage({ type: "webviewReady" });

    return () => window.removeEventListener("message", listeners);
  }, []);

  function cancel() {
    const generatePanelMessageClient =
      createMessageClient<GeneratePanelBrokerType>((message: unknown) => {
        getVSCodeApi().postMessage(message);
      });
    generatePanelMessageClient.send("cancel", undefined);
  }

  return (
    <div>
      <h1>
        Generating ({args.provider}:{args.model})
      </h1>
      <CSFormField>
        <VSCodeButton onClick={cancel}>Cancel</VSCodeButton>
      </CSFormField>
      <VSCodeDivider />
      <h3>Response</h3>
      <CSFormField>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <VSCodeProgressRing />{" "}
          <div style={{ marginLeft: "1em" }}>
            Received: {bytesReceived} bytes
          </div>
        </div>
      </CSFormField>
      <pre>{data || "generating..."}</pre>
      <VSCodeDivider style={{ marginTop: "1em" }} />
      <h3>Prompt</h3>
      <pre>{prompt}</pre>
    </div>
  );
}
