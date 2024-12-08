import { NavigateOptions } from "./types.js";
import { NavigateEvent } from "../types.js";
import { UIContainer } from "../UIContainer.js";

// Helper type to extract props from components
type ComponentProps<T> = T extends React.ComponentType<infer P> ? P : never;

export function createNavigator<
  Routes extends Record<string, React.ComponentType<any>>
>(container: UIContainer) {
  return async function navigateTo<Path extends keyof Routes>(
    url: Path,
    args?: ComponentProps<Routes[Path]>,
    options?: NavigateOptions
  ): Promise<void> {
    return new Promise<void>((resolve) => {
      container.navigationPromiseResolvers.set(url as string, resolve);
      const navigateEvent: NavigateEvent = {
        type: "navigate",
        url: url as string,
        state: args,
      };

      const webview = container.getWebview();
      if (webview) {
        webview.postMessage(navigateEvent);
      }
    });
  };
}
