import * as React from "react";
import { createRoot } from "react-dom/client";
import { Route, Switch } from "wouter";
import { navigate } from "wouter/use-browser-location";
import { getVSCodeApi } from "../vscode/getVSCodeApi.js";
import { Generate } from "./html/pages/generate/Generate.js";
import { GenerateStream } from "./html/pages/generate/invoke/GenerateStream.js";
import { EditConfig } from "./html/pages/provider/EditConfig.js";
import { Initialize } from "./html/pages/initialize/Initialize.js";
import { History } from "./html/pages/history/History.js";
import { NavigateEvent } from "./types.js";
import { HistoryEntry } from "./html/pages/history/entry/HistoryEntry.js";

function App() {
  React.useEffect(() => {
    function listeners(event: unknown) {
      const incomingMessage = (event as any).data;
      switch (incomingMessage.type) {
        case "navigate":
          const eventArgs = incomingMessage as NavigateEvent;
          navigate(eventArgs.url, { state: eventArgs.state });
          getVSCodeApi().postMessage({
            type: "navigated",
            url: eventArgs.url,
          });
      }
    }
    window.addEventListener("message", listeners);

    getVSCodeApi().postMessage({ type: "webviewReady" });
    
    return () => window.removeEventListener("message", listeners);
  }, []);

  return (
    <>
      <Switch>
        <Route path="/generate" component={Generate} />
        <Route path="/generate/invoke" component={GenerateStream} />
        <Route path="/provider/config/edit" component={EditConfig} />
        <Route path="/history" component={History} />
        <Route path="/history/entry" component={HistoryEntry} />
        <Route path="/initialize" component={Initialize} />
      </Switch>
    </>
  );
}

export function initWebview() {
  function onReady() {
    const domRootNode = document.getElementById("root")!;
    const root = createRoot(domRootNode);
    root.render(<App />);
  }

  if (document.readyState === "complete") {
    onReady();
  } else {
    window.addEventListener("DOMContentLoaded", onReady);
  }
}
