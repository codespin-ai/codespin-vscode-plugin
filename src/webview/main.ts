import {
  provideVSCodeDesignSystem,
  vsCodeButton,
  vsCodeCheckbox,
  vsCodeTextArea,
  vsCodeTextField,
  vsCodeDropdown,
  vsCodeOption,
} from "@vscode/webview-ui-toolkit";

export { init as initGeneratePanel } from "../panels/GeneratePanel/init.js";

provideVSCodeDesignSystem().register(
  vsCodeButton(),
  vsCodeCheckbox(),
  vsCodeTextArea(),
  vsCodeTextField(),
  vsCodeDropdown(),
  vsCodeOption()
);
