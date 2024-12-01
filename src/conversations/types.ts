// Base content types
export type FileHeadingContent = {
  type: "file-heading";
  id: string;
  path: string;
  content: string;
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

// User message types
export type UserTextContent = {
  text: string;
};

export type UserImageContent = {
  path: string;
};

export type Message = UserMessage | AssistantMessage;

export type UserMessage = {
  role: "user";
  content: (UserTextContent | UserImageContent)[];
};

export type AssistantMessage = {
  role: "assistant";
  content: ContentItem[];
};

export type Conversation = {
  id: string;
  title: string;
  timestamp: number;
  model: string;
  codingConvention: string | null;
  includedFiles: {
    path: string;
  }[];
  messages: Message[];
};

export type ConversationSummary = {
  id: string;
  title: string;
  timestamp: number;
  model: string;
  codingConvention: string | null;
  includedFiles: {
    path: string;
  }[];
};

// Database types
export type DbBasicInfo = {
  id: string;
  title: string;
  timestamp: number;
  model: string;
  codingConvention: string | null;
};

export type DbIncludedFile = {
  path: string;
};

export type DbMessage = {
  role: "user" | "assistant";
  content: string;
};
