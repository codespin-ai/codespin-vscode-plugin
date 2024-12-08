import * as React from "react";
import { Navigate, RouteObject } from "react-router-dom";
import { withRouteState } from "./PageWrapper.js";

export function createRoutes<
  T extends Record<string, React.ComponentType<any>>
>(routes: T, defaultPath: keyof T): RouteObject[] {
  const routeObjects = Object.entries(routes).map(([path, Component]) => ({
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
    ...routeObjects,
  ];
}
