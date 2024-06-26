import {
  VSCodeButton,
  VSCodeDivider,
  VSCodeProgressRing,
} from "@vscode/webview-ui-toolkit/react/index.js";
import * as React from "react";
import { getVSCodeApi } from "../../../../vscode/getVSCodeApi.js";
import { EventTemplate } from "../../../EventTemplate.js";
import {
  PromptCreatedEvent,
  ResponseStreamEvent,
} from "../../../panels/generate/types.js";
import { CSFormField } from "../../components/CSFormField.js";

type GenerateStreamArgs = {
  api: string;
  model: string;
};

export function GenerateStream() {
  const args: GenerateStreamArgs = history.state;

  const [bytesReceived, setBytesReceived] = React.useState(0);
  let [data, setData] = React.useState("");
  const [prompt, setPrompt] = React.useState("");

  React.useEffect(() => {
    function listeners(event: MessageEvent<EventTemplate>) {
      const incomingMessage = event.data;
      switch (incomingMessage.type) {
        case "promptCreated":
          const { prompt } = incomingMessage as PromptCreatedEvent;
          setPrompt(prompt);
          return;
        case "responseStream":
          const { data: chunk } = incomingMessage as ResponseStreamEvent;
          data = data + chunk;
          setData(data);
          setBytesReceived(data.length);
          return;
      }
    }
    window.addEventListener("message", listeners);
    getVSCodeApi().postMessage({ type: "webviewReady" });
    return () => window.removeEventListener("message", listeners);
  }, []);

  function cancel() {
    getVSCodeApi().postMessage({ type: "cancel" });
  }

  return (
    <div>
      <h1>
        Generating ({args.api}:{args.model})
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
