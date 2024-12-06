import * as vscode from "vscode";
import * as path from "path";
import { OpenFileEvent } from "../types.js";

export async function handleOpenFile(
  message: OpenFileEvent,
  workspaceRoot: string
): Promise<void> {
  const filePath = path.resolve(workspaceRoot, message.file);
  const uri = vscode.Uri.file(filePath);
  await vscode.window.showTextDocument(uri, {
    preview: false,
    preserveFocus: false,
  });
}