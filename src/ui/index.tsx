import * as React from "react";
import { createRoot } from "react-dom/client";
import { Route, Switch } from "wouter";
import { navigate } from "wouter/use-browser-location";
import { getVsCodeApi } from "../vscode/getVsCodeApi.js";
import { Generate } from "./pages/generate/Generate.js";
import { NavigateEventArgs } from "./webviewEvents/NavigateEventArgs.js";
import { EditConfig } from "./pages/api/EditConfig.js";
import { GenerateStream } from "./pages/generate/GenerateStream.js";
import { History } from "./pages/history/History.js";
import { Initialize } from "./pages/initialize/Initialize.js";
import { HistoryEntry } from "./pages/history/HistoryEntry.js";

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

export function initWebView() {
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
