import * as React from "react";
import { Navigate, RouteObject } from "react-router-dom";
import { withRouteState } from "./PageWrapper.js";

type RouteComponents<T extends Record<string, unknown>> = {
  [K in keyof T]: React.ComponentType<T[K]>;
};

export function createRoutes<T extends Record<string, unknown>>(
  components: RouteComponents<T>,
  defaultPath: keyof T
): RouteObject[] {
  const routes = Object.entries(components).map(([path, Component]) => ({
    path,
    element: React.createElement(withRouteState(Component)),
  }));

  return [
    {
      path: "/",
      element: React.createElement(Navigate, {
        to: defaultPath as string,
        replace: true,
      }),
    },
    ...routes,
  ];
}
