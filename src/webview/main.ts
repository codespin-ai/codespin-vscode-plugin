import {
  provideVSCodeDesignSystem,
  vsCodeButton,
  vsCodeCheckbox,
  vsCodeTextArea,
  vsCodeTextField,
  vsCodeDropdown,
  vsCodeOption,
  vsCodeRadioGroup,
  vsCodeRadio,
  vsCodeDivider,
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
