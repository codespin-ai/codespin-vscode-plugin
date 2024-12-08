import { UIContainer } from "../UIContainer.js";

export type ComponentProps<T> = T extends React.ComponentType<infer P>
  ? P
  : never;

export type NavigationModule<
  T extends Record<string, React.ComponentType<any>>
> = {
  routes: T;
  container: UIContainer;
};

export type NavigateOptions = {
  replace?: boolean;
};
