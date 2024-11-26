import { HandlerParameters, Request, Response } from "./messageBroker.js";

// Helper function to generate a random 16-character alphanumeric string
function generateUniquePrefix(): string {
  return Math.random().toString(36).substring(2, 18); // Generates a 16-character string
}

// Define the structure of the MessageBroker client
export interface MessageBrokerClient<
  TRequestMap extends {
    [key in keyof TRequestMap]: HandlerParameters<any, any>;
  }
> {
  send<K extends Extract<keyof TRequestMap, string>>(
    type: K,
    parameters: TRequestMap[K]["parameters"]
  ): Promise<TRequestMap[K]["result"]>;
  onResponse: <K extends Extract<keyof TRequestMap, string>>(
    response: Response<TRequestMap, K>
  ) => void;
}

// The function to create a message broker client
export function createMessageBrokerClient<
  TRequestMap extends Record<string, HandlerParameters<any, any>>
>(
  sendRequest: <K extends Extract<keyof TRequestMap, string>>(
    request: Request<TRequestMap, K>
  ) => void
): MessageBrokerClient<TRequestMap> {
  // Generate a unique prefix for this instance
  const uniquePrefix = generateUniquePrefix();

  // Store pending requests (mapping id to the resolve function of the Promise)
  const pendingRequests: Map<string, (response: any) => void> = new Map();

  // Sequential ID generator, starts from 1
  let currentId = 1;

  // Function to generate a sequential ID with the unique prefix
  const generateSequentialId = () => `${uniquePrefix}-${currentId++}`;

  // Client's `send` method to send a request to the broker and wait for a response
  const send = <K extends Extract<keyof TRequestMap, string>>(
    type: K,
    parameters: TRequestMap[K]["parameters"]
  ): Promise<TRequestMap[K]["result"]> => {
    const id = generateSequentialId(); // Generate a unique ID for this request

    return new Promise((resolve) => {
      // Store the resolve function, so it can be called when the response is received
      pendingRequests.set(id, resolve);

      // Send the request to the broker with the unique ID and payload
      sendRequest({
        id,
        type,
        parameters,
      });
    });
  };

  function onResponse<K extends Extract<keyof TRequestMap, string>>(
    response: Response<TRequestMap, K>
  ) {
    const { id, result } = response;

    // If the response id matches a request id, resolve the corresponding promise
    if (pendingRequests.has(id)) {
      const resolve = pendingRequests.get(id);
      if (resolve) {
        resolve(result);
        pendingRequests.delete(id); // Remove the resolved request from the map
      }
    }
  }

  // Return the client object with the send method
  return { send, onResponse };
}
