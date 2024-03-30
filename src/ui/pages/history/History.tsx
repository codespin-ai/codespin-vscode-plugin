import * as React from "react";
import { getVsCodeApi } from "../../../vscode/getVsCodeApi.js";
import { HistoryPageArgs } from "./HistoryPageArgs.js";

export function History() {
  const vsCodeApi = getVsCodeApi();
  const args: HistoryPageArgs = history.state;

  return <div>History begins here...</div>;
}
