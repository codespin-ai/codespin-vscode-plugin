import { conversationRoutes } from "../routes.js";
import { initWebview as baseInitWebView } from "../../html/createApp.js";

export function initWebview() {
  baseInitWebView(conversationRoutes, "/start");
}