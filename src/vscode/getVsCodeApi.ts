import { WebviewApi } from "vscode-webview";

let vsCodeApi: WebviewApi<unknown>;

export function getVsCodeApi() {
  if (!vsCodeApi) {
    vsCodeApi = acquireVsCodeApi();
  }

  return vsCodeApi;
}
