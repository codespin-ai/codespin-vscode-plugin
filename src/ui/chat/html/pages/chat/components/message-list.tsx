import { BloomComponent, component } from "bloom-router";
import { Message } from "../../../../../../conversations/types.js";
import {
  FileHeadingContent,
  TextContent,
  CodeContent,
  MarkdownContent,
} from "../../../../../../conversations/types.js";

export type MessageListProps = {
  messages: Message[];
  currentBlock?:
    | FileHeadingContent
    | TextContent
    | CodeContent
    | MarkdownContent;
  chatEndRef: { current: HTMLDivElement | null };
};

export async function* MessageList(
  component: HTMLElement & BloomComponent & MessageListProps
) {
  const renderMessage = (message: Message) => {
    if (message.role === "user") {
      return <user-content-block message={message} />;
    }
    return (
      <div class="assistant-messages-list">
        {message.content.map((block) => (
          <assistant-content-block key={block.id} block={block} />
        ))}
      </div>
    );
  };

  while (true) {
    yield (
      <div class="flex-1 overflow-y-auto p-4">
        {component.messages.map((message, index) => (
          <div
            key={index}
            className={`max-w-6xl flex flex-col ${
              message.role === "assistant" ? "self-start" : "self-end"
            }`}
          >
            {renderMessage(message)}
          </div>
        ))}

        {component.currentBlock && (
          <div class="flex flex-col self-start">
            <assistant-content-block
              key={component.currentBlock.id}
              block={component.currentBlock}
            />
          </div>
        )}
        <div ref={component.chatEndRef} />
      </div>
    );
  }
}

component("message-list", MessageList, {
  messages: [],
  currentBlock: undefined,
  chatEndRef: { current: null },
});
