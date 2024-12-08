import { UIContainer } from "../UIContainer.js";

export type NavigationModule<T extends Record<string, unknown>> = {
  routes: T;
  container: UIContainer;
};

export type NavigateOptions = {
  replace?: boolean;
};
