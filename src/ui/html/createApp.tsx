import { Bloom } from "bloom-router";
import { getVSCodeApi } from "../../vscode/getVSCodeApi.js";
import { BrowserEvent, NavigateEvent } from "../types.js";

export function initWebview(
  routeConfig: Record<string, any>,
  basePath: string
) {
  function onReady() {
    const bloom = new Bloom("app");

    // Handle navigation messages from VS Code
    function listener(event: BrowserEvent) {
      const message = event.data;
      if (message.type === "navigate") {
        const eventArgs = message as NavigateEvent;
        bloom.goto(eventArgs.url);
        getVSCodeApi().postMessage({
          type: "navigated",
          url: eventArgs.url,
        });
      }
    }
    window.addEventListener("message", listener);

    // Notify VS Code that webview is ready
    getVSCodeApi().postMessage({ type: "webviewReady" });

    // Navigate to initial route
    bloom.goto(basePath);
  }

  if (document.readyState === "complete") {
    onReady();
  } else {
    window.addEventListener("DOMContentLoaded", onReady);
  }
}
