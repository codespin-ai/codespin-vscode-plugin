import * as React from "react";
import { Message } from "../../../../../../conversations/types.js";
import { AssistantContentBlock } from "../AssistantContentBlock.js";
import { UserContentBlock } from "../UserContentBlock.js";
import {
  FileHeadingContent,
  TextContent,
  CodeContent,
  MarkdownContent,
} from "../../../../../../conversations/types.js";

interface MessageListProps {
  messages: Message[];
  currentBlock:
    | FileHeadingContent
    | TextContent
    | CodeContent
    | MarkdownContent
    | null;
  chatEndRef: React.RefObject<HTMLDivElement>;
}

export function MessageList({
  messages,
  currentBlock,
  chatEndRef,
}: MessageListProps) {
  const renderMessage = (message: Message) => {
    if (message.role === "user") {
      return <UserContentBlock message={message} />;
    }
    return (
      <div className="assistant-messages-list">
        {message.content.map((block) => (
          <AssistantContentBlock key={block.id} block={block} />
        ))}
      </div>
    );
  };

  return (
    <div className="flex-1 overflow-y-auto p-4">
      {messages.map((message, index) => (
        <div
          key={index}
          className={`max-w-6xl flex flex-col ${
            message.role === "assistant" ? "self-start" : "self-end"
          }`}
        >
          {renderMessage(message)}
        </div>
      ))}

      {currentBlock && (
        <div className="flex flex-col self-start">
          <AssistantContentBlock key={currentBlock.id} block={currentBlock} />
        </div>
      )}
      <div ref={chatEndRef} />
    </div>
  );
}
