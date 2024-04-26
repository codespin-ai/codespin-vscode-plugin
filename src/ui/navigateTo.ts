import { UIContainer } from "./UIContainer.js";
import { NavigateEvent } from "./types.js";

export async function navigateTo<T>(
  uiContainer: UIContainer,
  url: string,
  args?: T
) {
  return new Promise<void>((resolve) => {
    uiContainer.navigationPromiseResolvers.set(url, resolve);
    const navigateEvent: NavigateEvent = {
      type: "navigate",
      url,
      state: args,
    };
    uiContainer.getWebview().postMessage(navigateEvent);
  });
}
