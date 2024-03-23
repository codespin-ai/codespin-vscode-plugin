import {
  provideVSCodeDesignSystem,
  vsCodeButton,
  vsCodeCheckbox,
  vsCodeDivider,
  vsCodeDropdown,
  vsCodeOption,
  vsCodeRadio,
  vsCodeRadioGroup,
  vsCodeTextArea,
  vsCodeTextField,
} from "@vscode/webview-ui-toolkit";

export { initWebView } from "../ui/index.js";

provideVSCodeDesignSystem().register(
  vsCodeButton(),
  vsCodeCheckbox(),
  vsCodeTextArea(),
  vsCodeTextField(),
  vsCodeDropdown(),
  vsCodeOption(),
  vsCodeCheckbox(),
  vsCodeRadioGroup(),
  vsCodeRadio(),
  vsCodeOption(),
  vsCodeDivider()
);
