import { chatRoutes } from "../routes.js";
import { initWebview as baseInitWebView } from "../../html/createApp.js";

export function initWebview() {
  baseInitWebView(chatRoutes, "/start");
}
