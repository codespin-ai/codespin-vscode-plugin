import * as React from "react";
import { ContentItem } from "../../../../../../conversations/types.js";

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

export function AssistantContentBlock({ block }: Props) {
  switch (block.type) {
    case "file-heading":
      return <></>;
    case "code":
      return (
        <div className="code-block">
          <div className="code-header">{block.path}</div>
          <div className="code-content">
            <div dangerouslySetInnerHTML={{ __html: block.html }} />
          </div>
        </div>
      );
    case "text":
      return (
        <div data-block-type="markdown" className="markdown">
          <pre className="whitespace-pre-wrap m-0 font-vscode-editor p-4 rounded-lg bg-vscode-input-background border border-vscode-input-border">
            {block.content}
          </pre>
        </div>
      );
    case "markdown":
      return (
        <div data-block-type="markdown" className="markdown">
          <div
            dangerouslySetInnerHTML={{
              __html: `${block.html}`,
            }}
          />
        </div>
      );
  }
}
