// types.ts - showing full file content
export type FileHeadingContentItem = {
  type: "file-heading";
  id: string;
  path: string;
  content: string;
};

export type TextContentItem = {
  type: "text";
  id: string;
  content: string;
};

export type CodeContentItem = {
  type: "code";
  id: string;
  path: string;
  content: string;
  html: string;
};

export type MarkdownContentItem = {
  type: "markdown";
  id: string;
  content: string;
  html: string;
};

export type ContentItem =
  | FileHeadingContentItem
  | TextContentItem
  | CodeContentItem
  | MarkdownContentItem;

export type UserMessageContent =
  | {
      type: "text";
      text: string;
    }
  | {
      type: "image";
      path: string;
    };

export type UserMessage = {
  role: "user";
  content: UserMessageContent[];
};

export type AssistantMessage = {
  role: "assistant";
  content: ContentItem[];
};

export type Message = UserMessage | AssistantMessage;
