import * as React from "react";
import { createRoot } from "react-dom/client";
import { Route, Switch } from "wouter";
import { navigate } from "wouter/use-browser-location";
import { StartChat } from "./pages/start/StartChat.js";
import { Chat } from "./pages/chat/Chat.js";
import { EditConfig } from "./pages/provider/EditConfig.js";
import { BrowserEvent } from "../../types.js";
import { getVSCodeApi } from "../../../vscode/getVSCodeApi.js";
import type { NavigateEvent } from "../../navigateTo.js";

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
        <Route path="/start" component={StartChat} />
        <Route path="/chat" component={Chat} />
        <Route path="/provider/config/edit" component={EditConfig} />
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
