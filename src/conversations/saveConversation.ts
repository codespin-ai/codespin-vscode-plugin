// // saveConversation.ts
// import * as fs from "fs/promises";
// import * as path from "path";
// import { getCodeSpinDir } from "../settings/codespinDirs.js";
// import {
//   ConversationsFile,
//   getConversationFileName,
//   getConversationFilePath,
//   getNextFileNumber,
// } from "./fileTypes.js";
// import { Message, ConversationSummary, UserMessage } from "./types.js";

// function getInitialTitle(messages: Message[]): string {
//   const firstMessage = messages[0];
//   if (firstMessage?.role === "user") {
//     const firstContent = firstMessage.content[0];
//     if ("text" in firstContent) {
//       return firstContent.text.slice(0, 128);
//     }
//   }
//   return "Untitled";
// }

// export async function saveConversation(params: {
//   id: string;
//   title: string;
//   timestamp: number;
//   model: string;
//   codingConvention: string | null;
//   messages: Message[];
//   workspaceRoot: string;
// }): Promise<void> {
//   const conversationsDir = path.join(
//     getCodeSpinDir(params.workspaceRoot),
//     "conversations"
//   );
//   const summariesPath = path.join(conversationsDir, "conversations.json");

//   let conversationsFile: ConversationsFile;
//   try {
//     const content = await fs.readFile(summariesPath, "utf-8");
//     conversationsFile = JSON.parse(content) as ConversationsFile;
//   } catch {
//     conversationsFile = {
//       lastFileNumber: 0,
//       conversations: [],
//     };
//   }

//   const title = params.title || getInitialTitle(params.messages);

//   let dirName: string;
//   const existingIndex = conversationsFile.conversations.findIndex(
//     (c) => c.id === params.id
//   );

//   if (existingIndex !== -1) {
//     // Use existing directory name
//     dirName = conversationsFile.conversations[existingIndex].fileName;
//   } else {
//     // Create new directory with next number
//     const fileNumber = getNextFileNumber(conversationsFile.lastFileNumber);
//     dirName = getConversationFileName(fileNumber);
//     conversationsFile.lastFileNumber = fileNumber;
//   }

//   const conversationDirPath = path.join(conversationsDir, dirName);
//   const conversationFilePath = path.join(
//     conversationDirPath,
//     getConversationFilePath(dirName)
//   );

//   // Create conversation directory if it doesn't exist
//   await fs.mkdir(conversationDirPath, { recursive: true });

//   const summary: ConversationSummary & { fileName: string } = {
//     id: params.id,
//     title,
//     timestamp: params.timestamp,
//     model: params.model,
//     codingConvention: params.codingConvention,
//     fileName: dirName,
//   };

//   if (existingIndex !== -1) {
//     conversationsFile.conversations[existingIndex] = summary;
//   } else {
//     conversationsFile.conversations.unshift(summary);
//   }

//   await fs.writeFile(summariesPath, JSON.stringify(conversationsFile, null, 2));

//   const conversation = {
//     ...params,
//     title,
//   };
//   await fs.writeFile(
//     conversationFilePath,
//     JSON.stringify(conversation, null, 2)
//   );
// }
