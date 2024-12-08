export type RequestHandler<TParameters, TResult> = (
  parameters: TParameters
) => Promise<TResult>;

export type HandlerParameters<P, R> = {
  parameters: P;
  result: R;
};

type AttachHandlerFunction<TRequestMap> = <K extends string, P, R>(
  type: K,
  handler: RequestHandler<P, R>
) => MessageBroker<TRequestMap & { [key in K]: HandlerParameters<P, R> }>;

// Represents a structured request
export interface Request<
  TRequestMap extends {
    [key in keyof TRequestMap]: HandlerParameters<any, any>;
  },
  K extends keyof TRequestMap
> {
  id: string; // Unique ID for the request
  type: K; // Request type identifier
  parameters: TRequestMap[K]["parameters"]; // Request-specific parameters
}

// Represents a structured response
export interface Response<
  TRequestMap extends {
    [key in keyof TRequestMap]: HandlerParameters<any, any>;
  },
  K extends keyof TRequestMap
> {
  id: string; // Matches the request ID
  result: TRequestMap[K]["result"]; // Request-specific result
}

export interface MessageBroker<
  TRequestMap extends {
    [key in keyof TRequestMap]: HandlerParameters<any, any>;
  }
> {
  attachHandler: AttachHandlerFunction<TRequestMap>; // Register a new handler
  handleRequest: <K extends keyof TRequestMap & string>(
    request: Request<TRequestMap, K>
  ) => Promise<Response<TRequestMap, K> | undefined>;
  canHandle: (type: string) => boolean; // Check if a handler exists for a type
}

export function createMessageBroker<
  TRequestMap extends {
    [key in keyof TRequestMap]: HandlerParameters<any, any>;
  },
  TResponse
>(
  requestHandlers: Map<string, RequestHandler<any, any>> = new Map()
): MessageBroker<TRequestMap> {
  const attachHandler: AttachHandlerFunction<TRequestMap> = <
    K extends string,
    P,
    R
  >(
    type: K,
    handler: RequestHandler<P, R>
  ) => {
    requestHandlers.set(type, handler);

    // Return a broker with extended types (existing + newly added handler type)
    return createMessageBroker<
      TRequestMap & { [key in K]: { parameters: P; result: R } },
      TResponse
    >(requestHandlers);
  };

  async function handleRequest<K extends keyof TRequestMap & string>(
    request: Request<TRequestMap, K>
  ) {
    const { id, type, parameters } = request;
    const handler = requestHandlers.get(type);

    if (handler) {
      const handlerResult = await handler(parameters);
      return {
        id,
        result: handlerResult,
      } as Response<TRequestMap, K>;
    }
  }

  function canHandle(type: string): boolean {
    return requestHandlers.has(type);
  }

  return {
    attachHandler,
    handleRequest,
    canHandle,
  };
}

export type BrokerType<
  TGetBroker extends (...params: any[]) => MessageBroker<any>
> = ReturnType<TGetBroker> extends MessageBroker<infer T> ? T : never;
