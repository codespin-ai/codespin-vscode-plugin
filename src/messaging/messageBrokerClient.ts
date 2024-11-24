import { EventHandlerMap, ResponseMessage } from "./messageBroker.js";

// Helper function to generate a random 16-character alphanumeric string
function generateUniquePrefix(): string {
  return Math.random().toString(36).substring(2, 18); // Generates a 16-character string
}

// Define the structure of the MessageBroker client
export interface MessageClient<TEvents extends EventHandlerMap, TMessageEvent> {
  send<K extends keyof TEvents>(
    event: K,
    payload: TEvents[K]["payload"]
  ): Promise<TEvents[K]["response"]>;
  onMessage: (event: TMessageEvent) => void;
}

// The function to create a message broker client
export function createMessageBrokerClient<
  TEvents extends EventHandlerMap,
  TMessageEvent extends { data: ResponseMessage<any> }
>(postMessage: Function): MessageClient<TEvents, TMessageEvent> {
  // Generate a unique prefix for this instance
  const uniquePrefix = generateUniquePrefix();

  // Store pending requests (mapping id to the resolve function of the Promise)
  const pendingRequests: Map<string, (response: any) => void> = new Map();

  // Sequential ID generator, starts from 1
  let currentId = 1;

  // Function to generate a sequential ID with the unique prefix
  const generateSequentialId = () => `${uniquePrefix}-${currentId++}`;

  // Client's `send` method to send an event to the broker and wait for a response
  const send = <K extends keyof TEvents>(
    event: K,
    payload: TEvents[K]["payload"]
  ): Promise<TEvents[K]["response"]> => {
    const id = generateSequentialId(); // Generate a unique ID for this request

    const responseId = `${id}-response`;

    return new Promise((resolve) => {
      // Store the resolve function, so it can be called when the response is received
      pendingRequests.set(responseId, resolve);

      // Send the event to the broker with the unique ID and payload
      postMessage({
        id,
        event,
        payload,
      });
    });
  };

  function onMessage(event: TMessageEvent) {
    const { id, response } = event.data as { id: string; response: any };

    // If the message ID matches a pending request, resolve the corresponding promise
    if (pendingRequests.has(id)) {
      const resolve = pendingRequests.get(id);
      if (resolve) {
        resolve(response);
        pendingRequests.delete(id); // Remove the resolved request from the map
      }
    }
  }

  // Return the client object with the send method
  return { send, onMessage };
}
