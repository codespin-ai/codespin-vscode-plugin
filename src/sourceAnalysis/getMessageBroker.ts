import { BrokerType, createMessageBroker } from "../messaging/messageBroker.js";
import { getHtmlForCode } from "./getHtmlForCode.js";
import { getLangFromFilename } from "./getLangFromFilename.js";

export function getMessageBroker() {
  const messageBroker = createMessageBroker().attachHandler(
    "applyStyling",
    async (params: { code: string; filename: string }) => {
      const lang = getLangFromFilename(params.filename);
      return getHtmlForCode(params.code, lang);
    }
  );

  return messageBroker;
}

export type SourceAnalysisBrokerType = BrokerType<typeof getMessageBroker>;
