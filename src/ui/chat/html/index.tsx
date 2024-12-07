import * as React from "react";
import { createRoot } from "react-dom/client";
import {
  RouterProvider,
  createBrowserRouter,
  Navigate,
  createRoutesFromElements,
  Route,
} from "react-router-dom";
import { StartChat } from "./pages/start/StartChat.js";
import { Chat } from "./pages/chat/Chat.js";
import { EditConfig } from "./pages/provider/EditConfig.js";
import { BrowserEvent, NavigateEvent } from "../../types.js";
import { getVSCodeApi } from "../../../vscode/getVSCodeApi.js";

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/" element={<Navigate to="/start" replace />} />
      <Route path="/start" element={<StartChat />} />
      <Route path="/chat" element={<Chat />} />
      <Route path="/provider/config/edit" element={<EditConfig />} />
    </>
  )
);

function App() {
  console.log("CodeSpin.AI extension started.");
  React.useEffect(() => {
    function listeners(event: BrowserEvent) {
      const message = event.data;

      switch (message.type) {
        case "navigate":
          const eventArgs = message as NavigateEvent;
          router.navigate(eventArgs.url, {
            state: eventArgs.state,
          });
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

  return <RouterProvider router={router} />;
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
