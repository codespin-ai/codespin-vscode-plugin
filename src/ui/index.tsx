import * as React from "react";
import { createRoot } from "react-dom/client";
import { Route, Switch } from "wouter";
import { navigate } from "wouter/use-browser-location";
import { getVsCodeApi } from "../vscode/getVsCodeApi.js";
import { NavigateEventArgs } from "./webviewEvents/NavigateEventArgs.js";
import { History } from "./pages/history/History.js";
import { Generate } from "./html/pages/generate/Generate.js";
import { GenerateStream } from "./html/pages/generate/GenerateStream.js";
import { EditConfig } from "./html/pages/api/EditConfig.js";
import { HistoryEntry } from "./html/pages/history/HistoryEntry.js";
import { Initialize } from "./html/pages/initialize/Initialize.js";

function App() {
  React.useEffect(() => {
    function listeners(event: any) {
      const incomingMessage = event.data;
      switch (incomingMessage.type) {
        case "navigate":
          const eventArgs = incomingMessage as NavigateEventArgs;
          navigate(eventArgs.url, { state: eventArgs.state });
          getVsCodeApi().postMessage({
            type: "navigated",
            url: eventArgs.url,
          });
      }
    }
    window.addEventListener("message", listeners);
    getVsCodeApi().postMessage({ type: "webviewReady" });
    return () => window.removeEventListener("click", listeners);
  }, []);

  return (
    <>
      <Switch>
        <Route path="/generate" component={Generate} />
        <Route path="/generate/invoke" component={GenerateStream} />
        <Route path="/api/config/edit" component={EditConfig} />
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
