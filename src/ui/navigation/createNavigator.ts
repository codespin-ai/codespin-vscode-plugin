import { BloomComponent } from "bloom-router";
import { NavigateEvent } from "../types.js";
import { UIContainer } from "../UIContainer.js";

export type NavigateOptions = {
  replace?: boolean;
};

export function createNavigator<
  Routes extends Record<
    string,
    (
      component: HTMLElement & Component & any
    ) => AsyncGenerator<JSX.Element, unknown, unknown>
  >
>(container: UIContainer) {
  return async function navigateTo<Path extends keyof Routes>(
    url: Path,
    args?: any,
    options?: NavigateOptions
  ): Promise<void> {
    return new Promise<void>((resolve) => {
      container.navigationPromiseResolvers.set(url as string, resolve);
      const navigateEvent: NavigateEvent = {
        type: "navigate",
        url: url as string,
      };

      const webview = container.getWebview();
      if (webview) {
        webview.postMessage(navigateEvent);
      }
    });
  };
}
