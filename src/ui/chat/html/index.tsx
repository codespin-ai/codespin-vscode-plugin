// src/ui/chat/html/index.tsx
import * as React from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { getVSCodeApi } from "../../../vscode/getVSCodeApi.js";
import { createRoutes } from "../../navigation/createRoutes.js";
import { BrowserEvent, NavigateEvent } from "../../types.js";
import type { ChatRoutes } from "../routes.js";
import { Chat } from "./pages/chat/Chat.js";
import { EditConfig } from "./pages/provider/EditConfig.js";
import { StartChat } from "./pages/start/StartChat.js";

const routes = createRoutes<ChatRoutes>(
  {
    "/chat": Chat,
    "/start": StartChat,
    "/provider/config/edit": EditConfig,
  },
  "/start"
);

const router = createBrowserRouter(routes);

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
