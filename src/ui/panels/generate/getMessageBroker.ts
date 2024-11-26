// import * as path from "path";
// import * as vscode from "vscode";
// import { createMessageBroker } from "../../../messaging/messageBroker.js";
// import { setDefaultModel } from "../../../settings/models/setDefaultModel.js";
// import { editAnthropicConfig } from "../../../settings/provider/editAnthropicConfig.js";
// import { editOpenAIConfig } from "../../../settings/provider/editOpenAIConfig.js";
// import {
//   EditAnthropicConfigEvent,
//   EditOpenAIConfigEvent,
// } from "../../../settings/provider/types.js";
// import { saveUIProps } from "../../../settings/ui/saveUIProps.js";
// import { navigateTo } from "../../navigateTo.js";
// import { addDeps } from "./addDeps.js";
// import { copyToClipboard } from "./copyToClipboard.js";
// import { GeneratePanel } from "./GeneratePanel.js";
// import { getGenerateArgs } from "./getGenerateArgs.js";
// import { invokeGeneration } from "./invokeGenerate.js";
// import {
//   AddDepsEvent,
//   CopyToClipboardEvent,
//   GenerateEvent,
//   ModelChangeEvent,
//   NewHistoryEntryEvent,
//   OpenFileEvent,
//   UIPropsUpdateEvent,
// } from "./types.js";

// export function getMessageBroker(
//   generatePanel: GeneratePanel,
//   postMessage: (message: any) => void,
//   workspaceRoot: string
// ) {
//   const messageBroker = createMessageBroker(postMessage)
//     .attachHandler("addDeps", async (message: AddDepsEvent) => {
//       await addDeps(generatePanel, message, workspaceRoot);
//     })
//     .attachHandler("copyToClipboard", async (message: unknown) => {
//       if (generatePanel.dirName === undefined) {
//         generatePanel.dirName = Date.now().toString();
//       }

//       await copyToClipboard(
//         message as CopyToClipboardEvent,
//         generatePanel.dirName,
//         workspaceRoot
//       );

//       const newHistoryEntry: NewHistoryEntryEvent = {
//         type: "newHistoryEntry",
//       };

//       generatePanel.globalEventEmitter.emit("message", newHistoryEntry);
//     })
//     .attachHandler("generate", async (message: unknown) => {
//       generatePanel.userInput = message as GenerateEvent;

//       if (generatePanel.dirName === undefined) {
//         generatePanel.dirName = Date.now().toString();
//       }

//       const generateArgs = await getGenerateArgs(
//         generatePanel,
//         generatePanel.dirName,
//         workspaceRoot
//       );

//       switch (generateArgs.status) {
//         case "can_generate":
//           try {
//             await invokeGeneration(
//               generatePanel,
//               generateArgs,
//               generatePanel.dirName,
//               workspaceRoot
//             );
//           } finally {
//             const newHistoryEntry: NewHistoryEntryEvent = {
//               type: "newHistoryEntry",
//             };
//             generatePanel.globalEventEmitter.emit("message", newHistoryEntry);
//             generatePanel.dispose();
//           }
//           break;
//         case "missing_config":
//           await navigateTo(generatePanel, `/provider/config/edit`, {
//             provider: generateArgs.provider,
//           });
//           break;
//       }
//     })
//     .attachHandler("editAnthropicConfig", async (message: unknown) => {
//       await editAnthropicConfig(message as EditAnthropicConfigEvent);
//       await generatePanel.onMessage(generatePanel.userInput!);
//     })
//     .attachHandler("editOpenAIConfig", async (message: unknown) => {
//       await editOpenAIConfig(message as EditOpenAIConfigEvent);
//       await generatePanel.onMessage(generatePanel.userInput!);
//     })
//     .attachHandler("modelChange", async (message: unknown) => {
//       await setDefaultModel((message as ModelChangeEvent).model, workspaceRoot);
//     })
//     .attachHandler("uiPropsUpdate", async (message: unknown) => {
//       const event = message as UIPropsUpdateEvent;
//       saveUIProps(
//         {
//           promptTextAreaHeight: event.promptTextAreaHeight,
//           promptTextAreaWidth: event.promptTextAreaWidth,
//         },
//         workspaceRoot
//       );
//     })
//     .attachHandler("openFile", async (message: unknown) => {
//       const filePath = path.resolve(
//         workspaceRoot,
//         (message as OpenFileEvent).file
//       );
//       const uri = vscode.Uri.file(filePath);
//       vscode.window.showTextDocument(uri, {
//         preview: false,
//         preserveFocus: false,
//       });
//     })
//     .attachHandler("cancel", async (message: unknown) => {
//       if (generatePanel.cancelGeneration) {
//         generatePanel.cancelGeneration();
//       }
//       generatePanel.dispose();
//     });

//   return messageBroker;
// }
