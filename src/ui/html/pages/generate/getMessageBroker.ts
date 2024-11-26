import { BrokerType, createMessageBroker } from "../../../../messaging/messageBroker.js";
import { IncludeFilesEvent } from "../../../panels/generate/types.js";

export function getMessageBroker(
  setFiles: (
    fn: (
      files: { path: string; size: number }[]
    ) => { path: string; size: number }[]
  ) => void
) {
  return createMessageBroker().attachHandler(
    "includeFiles",
    async (includeFilesMessage: IncludeFilesEvent) => {
      setFiles((files) => {
        const newFiles = includeFilesMessage.files.filter((x) =>
          files.every((file) => file.path !== x.path)
        );

        return files.concat(
          newFiles.map((file) => ({
            path: file.path,
            includeOption: "source",
            size: file.size,
          }))
        );
      });
    }
  );
}

export type GeneratePageBrokerType = BrokerType<typeof getMessageBroker>;
