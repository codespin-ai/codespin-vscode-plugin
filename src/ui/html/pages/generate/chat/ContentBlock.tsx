import * as React from "react";
import { ContentItem } from "./types.js";

type Props = {
  block: ContentItem;
};

export function ContentBlock({ block }: Props) {
  const baseBlockStyles =
    "rounded p-4 mb-4 border bg-vscode-input-background border-vscode-input-border text-vscode-input-foreground";

  switch (block.type) {
    case "file-heading":
      return (
        <div data-block-type="file-heading" className={baseBlockStyles}>
          <div className="mb-2 font-vscode-editor">File: {block.path}</div>
          <pre className="whitespace-pre-wrap m-0 font-vscode-editor">
            {block.content}
          </pre>
        </div>
      );
    case "code":
      return (
        <div
          data-block-type="code"
          className="mb-4 bg-vscode-input-background font-vscode-editor [&_pre]:p-4"
        >
          <div dangerouslySetInnerHTML={{ __html: block.html }} />
        </div>
      );
    case "text":
    default:
      return (
        <div data-block-type="text" className={baseBlockStyles}>
          <pre className="whitespace-pre-wrap m-0 font-vscode-editor">
            {block.content}
          </pre>
        </div>
      );
  }
}
