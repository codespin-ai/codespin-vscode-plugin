// User message types
export type UserTextContent = {
  type: "text";
  text: string;
};

export type UserImageContent = {
  type: "image";
  path: string;
};

export type UserFileContent = {
  type: "file";
  path: string;
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

// Other types...
export type Message = UserMessage | AssistantMessage;

export type Conversation = {
  id: string;
  title: string;
  timestamp: number;
  model: string;
  codingConvention: string | null;
  messages: Message[];
};

export type ConversationSummary = {
  id: string;
  title: string;
  timestamp: number;
  model: string;
  codingConvention: string | null;
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
