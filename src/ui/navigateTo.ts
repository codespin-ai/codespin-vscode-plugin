import { UIContainer } from "./UIContainer.js";

// Base navigation utility
export async function navigateTo<TState>(
  uiContainer: UIContainer,
  url: string,
  state?: TState
): Promise<void> {
  return new Promise<void>((resolve) => {
    uiContainer.navigationPromiseResolvers.set(url, resolve);
    const navigateEvent = {
      type: "navigate" as const,
      url,
      state,
    };

    const webview = uiContainer.getWebview();
    if (webview) {
      webview.postMessage(navigateEvent);
    }
  });
}
