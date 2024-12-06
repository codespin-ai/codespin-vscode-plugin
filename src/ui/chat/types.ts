import { SourceFile } from "codespin/dist/sourceCode/SourceFile.js";

export type FileVersions = "current" | "HEAD";

export type IncludeFilesArgs = {
  files: {
    path: string;
    size: number;
  }[];
};

export type IncludeFilesEvent = {
  type: "includeFiles";
} & IncludeFilesArgs;

export type ResponseStreamArgs = {
  data: string;
};

export type ResponseStreamEvent = {
  type: "responseStream";
} & ResponseStreamArgs;

export type ProcessedStreamingFileParseResult =
  | {
      type: "text";
      content: string;
    }
  | {
      type: "end-file-block";
      file: SourceFile;
      html: string;
    }
  | {
      type: "start-file-block";
      path: string;
    }
  | {
      type: "markdown";
      content: string;
      html: string;
    };

export type FileResultStreamArgs = {
  data: ProcessedStreamingFileParseResult;
};

export type FileResultStreamEvent = {
  type: "fileResultStream";
} & FileResultStreamArgs;

export type DoneEvent = {
  type: "done";
};

export type AddDepsArgs = {
  file: string;
  model: string;
};

export type AddDepsEvent = {
  type: "addDeps";
} & AddDepsArgs;

export type OpenFileArgs = {
  file: string;
};

export type OpenFileEvent = {
  type: "openFile";
} & OpenFileArgs;

export type ModelChange = {
  model: string;
};

export type ModelChangeEvent = {
  type: "modelChange";
} & ModelChange;

export type StartChatEvent = {
  type: "startChat";
} & StartChatUserInput;

export type StartChatUserInput = {
  model: string;
  codingConvention: string | undefined;
  prompt: string;
  includedFiles: Array<{
    path: string;
    size: number;
  }>;
};

export type CopyToClipboardUserInput = {
  prompt: string;
  codingConvention: string | undefined;
  includedFiles: {
    path: string;
  }[];
};

export type CopyToClipboardEvent = {
  type: "copyToClipboard";
} & CopyToClipboardUserInput;

export type MarkdownToHtmlArgs = {
  content: string;
};

export type MarkdownToHtmlEvent = {
  type: "markdownToHtml";
} & MarkdownToHtmlArgs;

export type SourceCodeToHtmlArgs = {
  content: string;
};

export type SourceCodeToHtmlEvent = {
  type: "sourceCodeToHtml";
  filePath: string;
} & SourceCodeToHtmlArgs;

export type NewConversationEvent = {
  type: "newConversation";
};

// New types for navigation state
export type ChatPageState = {
  model: string;
  startChat?: StartChatUserInput;
};

export type ConfigPageState = {
  provider: string;
  startChatUserInput: StartChatUserInput;
};
