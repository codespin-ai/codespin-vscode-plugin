import { WebviewApi } from "vscode-webview";

let vsCodeApi: WebviewApi<unknown>;

export function getVSCodeApi() {
  if (!vsCodeApi) {
    vsCodeApi = acquireVsCodeApi();
  }

  return vsCodeApi;
}
