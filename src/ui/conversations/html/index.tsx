import * as React from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { getVSCodeApi } from "../../../vscode/getVSCodeApi.js";
import { createRoutes } from "../../navigation/createRoutes.js";
import { BrowserEvent, NavigateEvent } from "../../types.js";
import type { ConversationRoutes } from "../routes.js";
import { Conversations } from "./pages/conversations/Conversations.js";
import { Initialize } from "./pages/initialize/Initialize.js";

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

  const routes = createRoutes<ConversationRoutes>(
    {
      "/conversations": Conversations,
      "/initialize": Initialize,
    },
    "/conversations"
  );

  const router = createBrowserRouter(routes);

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
