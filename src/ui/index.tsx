import * as React from "react";
import { createRoot } from "react-dom/client";
import { Route, Switch } from "wouter";
import { navigate } from "wouter/use-browser-location";
import { getVSCodeApi } from "../vscode/getVSCodeApi.js";
import { Generate } from "./html/pages/generate/Generate.js";
import { Chat } from "./html/pages/generate/chat/Chat.js";
import { HistoryEntry } from "./html/pages/history/entry/HistoryEntry.js";
import { History } from "./html/pages/history/History.js";
import { Initialize } from "./html/pages/initialize/Initialize.js";
import { EditConfig } from "./html/pages/provider/EditConfig.js";
import { BrowserEvent, NavigateEvent } from "./types.js";

function App() {
  console.log("CodeSpin.AI extension started.");
  React.useEffect(() => {
    function listeners(event: BrowserEvent) {
      const message = event.data;

      switch (message.type) {
        case "navigate":
          const eventArgs = message as NavigateEvent;
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
        <Route path="/generate/chat" component={Chat} />
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
