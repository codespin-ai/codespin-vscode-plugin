import type { ComponentType } from "react";
import * as React from "react";
import { createRoot } from "react-dom/client";
import {
  RouterProvider,
  createBrowserRouter
} from "react-router-dom";
import { getVSCodeApi } from "../../vscode/getVSCodeApi.js";
import { createRoutes } from "../navigation/createRoutes.js";
import { BrowserEvent, NavigateEvent } from "../types.js";

export function createApp(
  routeConfig: Record<string, ComponentType<any>>,
  basePath: string
) {
  function App() {
    const router = React.useMemo(() => {
      const configuredRoutes = createRoutes(routeConfig, basePath);
      return createBrowserRouter(configuredRoutes);
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

  return App;
}

export function initWebview(
  routeConfig: Record<string, ComponentType<any>>,
  basePath: string
) {
  const App = createApp(routeConfig, basePath);

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
