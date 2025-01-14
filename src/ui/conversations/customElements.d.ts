import "webjsx";
import { InitializePage } from "./html/pages/initialize/initialize-page.js";
import { ConversationsPage } from "./html/pages/conversations/conversations-page.js";

type PropType<T> = T extends (
  component: HTMLElement & Component & infer P
) => any
  ? P
  : never;

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "initialize-page": PropType<InitializePage>;
      "conversations-page": PropType<ConversationsPage>;
      "vscode-button": any;
    }
  }
}
