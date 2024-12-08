import * as React from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { getVSCodeApi } from "../../../vscode/getVSCodeApi.js";
import { createRoutes } from "../../navigation/createRoutes.js";
import { BrowserEvent, NavigateEvent } from "../../types.js";
import { conversationRoutes } from "../routes.js";

function App() {
  const router = React.useMemo(() => {
    const routes = createRoutes(conversationRoutes, "/conversations");
    return createBrowserRouter(routes);
  }, []);

  React.useEffect(() => {
    function listeners(event: BrowserEvent) {
      const message = event.data;
      if (message.type === "navigate") {
        const eventArgs = message as NavigateEvent;
        router.navigate(eventArgs.url, { state: eventArgs.state });
        getVSCodeApi().postMessage({
          type: "navigated",
          url: eventArgs.url,
        });
      }
    }
    window.addEventListener("message", listeners);
    getVSCodeApi().postMessage({ type: "webviewReady" });
    return () => window.removeEventListener("message", listeners);
  }, [router]);

  return <RouterProvider router={router} />;
}

export function initWebview() {
  function onReady() {
    const root = createRoot(document.getElementById("root")!);
    root.render(<App />);
  }

  if (document.readyState === "complete") {
    onReady();
  } else {
    window.addEventListener("DOMContentLoaded", onReady);
  }
}
