export type EventHandler<TPayload, TResponse> = (
  payload: TPayload
) => Promise<TResponse>;

export type EventHandlerMap = {
  [event: string]: {
    payload: any;
    response: any;
  };
};

type AttachHandlerFunction<
  TEvents extends EventHandlerMap,
  TMessageEvent extends { data: Message<any> }
> = <K extends string, P, R>(
  event: K,
  handler: EventHandler<P, R>
) => MessageBroker<
  TEvents & { [key in K]: { payload: P; response: R } },
  TMessageEvent
>;

// Structure for the message we receive and send
export interface Message<TPayload> {
  id: string; // Unique ID to match requests and responses
  event: string; // Event type
  payload: TPayload; // Payload to be passed to the handler
}

export interface ResponseMessage<TResponse> {
  id: string; // Same unique ID to respond back to the correct request
  response: TResponse; // Handler's response
}

export interface MessageBroker<
  TEvents extends EventHandlerMap,
  TMessageEvent extends { data: Message<any> } = any
> {
  attachHandler: AttachHandlerFunction<TEvents, TMessageEvent>;
  onMessage: (event: TMessageEvent) => void;
}

export function createMessageBroker<
  TEvents extends EventHandlerMap,
  TMessageEvent extends { data: any },
  TResponse
>(
  postMessage: (message: any) => void,
  _eventHandlers?: Map<string, EventHandler<any, any>>
): MessageBroker<TEvents, TMessageEvent> {
  // State to store event handlers
  const eventHandlers: Map<string, EventHandler<any, any>> = _eventHandlers ??
  new Map();

  // The attachHandler function adds event handlers and updates the broker's types
  const attachHandler: AttachHandlerFunction<TEvents, TMessageEvent> = <
    K extends string,
    P,
    R
  >(
    event: K,
    handler: EventHandler<P, R>
  ) => {
    eventHandlers.set(event, handler);
    // Return a new broker instance with extended types (previous events + new event)
    return createMessageBroker<
      TEvents & { [key in K]: { payload: P; response: R } },
      TMessageEvent,
      TResponse
    >(postMessage, eventHandlers);
  };

  async function onMessage(event: TMessageEvent) {
    const { id, event: eventType, payload } = event.data as Message<any>;

    // Check if a handler exists for this event
    const handler = eventHandlers.get(eventType);

    if (handler) {
      // Call the handler with the unwrapped payload
      const response = await handler(payload);

      // Send the response back, wrapping it in the ResponseMessage structure
      const responseMessage: ResponseMessage<any> = {
        id: id + "-response", // Use the same ID to match the original request
        response,
      };

      postMessage(responseMessage);
    }
  }

  // Return the broker with attachHandler, startListening, and stopListening methods
  return {
    attachHandler,
    onMessage,
  };
}
