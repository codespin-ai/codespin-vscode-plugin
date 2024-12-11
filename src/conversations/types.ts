export type UserTextContent = {
  type: "text";
  text: string;
  html: string;
};

export type UserImageContent = {
  type: "image";
  path: string;
};

export type IncludedFile = {
  path: string;
};

export type UserFileContent = {
  type: "files";
  includedFiles: IncludedFile[];
};

export type UserMessage = {
  role: "user";
  content: (UserTextContent | UserImageContent | UserFileContent)[];
};

// Assistant Message
export type FileHeadingContent = {
  type: "file-heading";
  id: string;
  path: string;
};

export type TextContent = {
  type: "text";
  id: string;
  content: string;
};

export type CodeContent = {
  type: "code";
  id: string;
  path: string;
  content: string;
  html: string;
};

export type MarkdownContent = {
  type: "markdown";
  id: string;
  content: string;
  html: string;
};

export type ContentItem =
  | FileHeadingContent
  | TextContent
  | CodeContent
  | MarkdownContent;

export type AssistantMessage = {
  role: "assistant";
  content: ContentItem[];
};

export type Message = UserMessage | AssistantMessage;

export type Conversation = {
  id: string;
  title: string;
  timestamp: number;
  model: string;
  codingConvention: string | undefined;
  messages: Message[];
};

export type ConversationSummary = {
  id: string;
  title: string;
  timestamp: number;
  model: string;
  codingConvention: string | undefined;
};

export interface ConversationsFile {
  conversations: ConversationSummary[];
}
