import { NavigationModule, NavigateOptions } from "./types.js";
import { NavigateEvent } from "../types.js";

export function createNavigator<T extends Record<string, unknown>>(
  module: NavigationModule<T>
) {
  return async function navigateTo<TPath extends keyof T>(
    url: TPath,
    args?: T[TPath],
    options?: NavigateOptions
  ): Promise<void> {
    return new Promise<void>((resolve) => {
      module.container.navigationPromiseResolvers.set(url as string, resolve);
      const navigateEvent: NavigateEvent = {
        type: "navigate",
        url: url as string,
        state: args,
      };

      const webview = module.container.getWebview();
      if (webview) {
        webview.postMessage(navigateEvent);
      }
    });
  };
}
