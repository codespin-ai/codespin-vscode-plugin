import * as React from "react";

type ContentBlock = {
  id: string;
  type: "file" | "text" | "html";
  content: string;
  path?: string;
};

type Props = {
  block: ContentBlock;
};

export function ContentBlock({ block }: Props) {
  switch (block.type) {
    case "file":
      return (
        <div
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

    case "html":
      return (
        <div
          style={{
            backgroundColor: "var(--vscode-editor-background)",
            padding: "1em",
            borderRadius: "8px",
            marginBottom: "1em",
            border: "1px solid var(--vscode-panel-border)",
          }}
          // Since we're ignoring markdown, html blocks are treated as text
          // If you later decide to handle HTML, ensure it's sanitized
          dangerouslySetInnerHTML={{ __html: block.content }}
        />
      );

    case "text":
    default:
      return (
        <div
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
