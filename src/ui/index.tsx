import { Route, Switch, useLocation } from "wouter";
import * as React from "react";
import { createRoot } from "react-dom/client";
import { Generate } from "./pages/Generate.js";

export type AppProps = {
  url: string;
};

function App(props: AppProps) {
  const [location, navigate] = useLocation();

  React.useEffect(() => {
    if (props.url) {
      navigate(props.url);
    }
  }, []);

  return (
    <>
      <Switch>
        <Route path="/generate" component={Generate} />
        <Route>Loading.........</Route>
      </Switch>
    </>
  );
}

export function initWebView(defaultUrl: string) {
  function onReady() {
    const domRootNode = document.getElementById("root")!;
    const root = createRoot(domRootNode);
    root.render(<App url={defaultUrl} />);
  }

  if (document.readyState === "complete") {
    onReady();
  } else {
    window.addEventListener("DOMContentLoaded", onReady);
  }
}
