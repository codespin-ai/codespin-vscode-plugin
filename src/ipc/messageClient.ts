import { HandlerParameters, Request, Response } from "./messageBroker.js";

// Generates a unique 16-character alphanumeric string
function generateUniquePrefix(): string {
  return Math.random().toString(36).substring(2, 18);
}

export interface MessageClient<
  TRequestMap extends {
    [key in keyof TRequestMap]: HandlerParameters<any, any>;
  }
> {
  send<K extends keyof TRequestMap>(
    type: K,
    parameters: TRequestMap[K]["parameters"]
  ): void;
  wait<K extends keyof TRequestMap>(
    type: K,
    parameters: TRequestMap[K]["parameters"]
  ): Promise<TRequestMap[K]["result"]>;
  onResponse: <K extends keyof TRequestMap>(
    response: Response<TRequestMap, K>
  ) => void;
}

export function createMessageClient<
  TRequestMap extends {
    [key in keyof TRequestMap]: HandlerParameters<any, any>;
  }
>(
  sendRequest: <K extends keyof TRequestMap>(
    request: Request<TRequestMap, K>
  ) => void
): MessageClient<TRequestMap> {
  const uniquePrefix = generateUniquePrefix();
  const pendingRequests = new Map<string, (response: any) => void>();
  let currentId = 1;

  const generateSequentialId = () => `${uniquePrefix}-${currentId++}`;

  const send = <K extends keyof TRequestMap>(
    type: K,
    parameters: TRequestMap[K]["parameters"]
  ): void => {
    const id = generateSequentialId();
    sendRequest({ id, type, parameters });
  };

  const wait = <K extends keyof TRequestMap>(
    type: K,
    parameters: TRequestMap[K]["parameters"]
  ): Promise<TRequestMap[K]["result"]> => {
    const id = generateSequentialId();

    return new Promise((resolve) => {
      pendingRequests.set(id, resolve);
      sendRequest({ id, type, parameters });
    });
  };

  function onResponse<K extends keyof TRequestMap>(
    response: Response<TRequestMap, K>
  ) {
    const { id, result } = response;

    if (pendingRequests.has(id)) {
      const resolve = pendingRequests.get(id);
      if (resolve) {
        resolve(result);
        pendingRequests.delete(id);
      }
    }
  }

  return { send, wait, onResponse };
}
