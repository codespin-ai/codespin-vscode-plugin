import * as React from "react";
import { ContentItem } from "./types.js";

type Props = {
  block: ContentItem;
};

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "markdown-component": any;
    }
  }
}

export function ContentBlock({ block }: Props) {
  const baseBlockStyles =
    "rounded p-4 mb-4 border bg-vscode-input-background border-vscode-input-border text-vscode-input-foreground";

  switch (block.type) {
    case "file-heading":
      return <></>;
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
      return (
        <div data-block-type="text" className={baseBlockStyles}>
          <pre className="whitespace-pre-wrap m-0 font-vscode-editor">
            {block.content}
          </pre>
        </div>
      );
    case "markdown":
      return (
        <div data-block-type="markdown" className={baseBlockStyles}>
          <div className="prose prose-invert max-w-none whitespace-pre-wrap m-0 font-vscode-editor">
            <div
              dangerouslySetInnerHTML={{
                __html: `${block.html}`,
              }}
            />
          </div>
        </div>
      );
  }
}
