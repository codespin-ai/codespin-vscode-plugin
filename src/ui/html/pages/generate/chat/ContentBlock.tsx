import * as React from "react";
import { ContentItem } from "./types.js";

type Props = {
  block: ContentItem;
};

export function ContentBlock({ block }: Props) {
  switch (block.type) {
    case "file-heading":
      return (
        <div
          data-block-type="file"
          style={{
            backgroundColor: "var(--vscode-editor-background)",
            padding: "1em",
            borderRadius: "8px",
            marginBottom: "1em",
            border: "1px solid var(--vscode-panel-border)",
          }}
        >
          <div
            style={{
              marginBottom: "0.5em",
              fontFamily: "var(--vscode-editor-font-family)",
            }}
          >
            File: {block.path}
          </div>
          <pre
            style={{
              whiteSpace: "pre-wrap",
              margin: 0,
              fontFamily: "var(--vscode-editor-font-family)",
              color: "var(--vscode-editor-foreground)",
            }}
          >
            {block.content}
          </pre>
        </div>
      );

    case "code":
      return (
        <div
          data-block-type="html"
          style={{
            backgroundColor: "var(--vscode-editor-background)",
            padding: "1em",
            borderRadius: "8px",
            marginBottom: "1em",
            border: "1px solid var(--vscode-panel-border)",
          }}
          dangerouslySetInnerHTML={{ __html: block.content }}
        />
      );

    case "text":
    default:
      return (
        <div
          data-block-type="text"
          style={{
            backgroundColor: "var(--vscode-editor-background)",
            padding: "1em",
            borderRadius: "8px",
            marginBottom: "1em",
            border: "1px solid var(--vscode-panel-border)",
          }}
        >
          <pre
            style={{
              whiteSpace: "pre-wrap",
              margin: 0,
              fontFamily: "var(--vscode-editor-font-family)",
              color: "var(--vscode-editor-foreground)",
            }}
          >
            {block.content}
          </pre>
        </div>
      );
  }
}
