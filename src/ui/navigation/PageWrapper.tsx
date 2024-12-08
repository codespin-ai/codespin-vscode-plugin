import * as React from "react";
import { useLocation } from "react-router-dom";

type PageComponent<T> = React.ComponentType<T>;

// Add constraint to ensure T is a valid props type
export function withRouteState<T extends React.JSX.IntrinsicAttributes>(
  Component: PageComponent<T>
) {
  return function RouteStateWrapper() {
    const location = useLocation();
    const props = location.state as T;
    return React.createElement(Component, props);
  };
}
