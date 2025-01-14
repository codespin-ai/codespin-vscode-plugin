import { component, Component } from "magic-loop";
import { ContentItem } from "../../../../../../conversations/types.js";

type AssistantContentBlockProps = {
  block: ContentItem | null;
};

export async function* AssistantContentBlock(
  component: HTMLElement & Component & AssistantContentBlockProps
) {
  const block = component.block;

  if (block) {
    switch (block.type) {
      case "file-heading":
        return <></>;
      case "code":
        return (
          <div class="code-block">
            <div class="code-header">{block.path}</div>
            <div class="code-content">
              <div dangerouslySetInnerHTML={{ __html: block.html }} />
            </div>
          </div>
        );
      case "text":
        return (
          <div data-block-type="markdown" class="markdown">
            <pre class="whitespace-pre-wrap m-0 font-vscode-editor p-4 rounded-lg bg-vscode-input-background border border-vscode-input-border">
              {block.content}
            </pre>
          </div>
        );
      case "markdown":
        return (
          <div data-block-type="markdown" class="markdown">
            <div
              dangerouslySetInnerHTML={{
                __html: `${block.html}`,
              }}
            />
          </div>
        );
    }
  } else {
    return <></>;
  }
}

component("assistant-content-block", AssistantContentBlock, {
  block: null,
});
