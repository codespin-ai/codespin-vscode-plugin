import {
  provideVSCodeDesignSystem,
  vsCodeButton,
  vsCodeCheckbox,
  vsCodeDivider,
  vsCodeDropdown,
  vsCodeOption,
  vsCodeProgressRing,
  vsCodeRadio,
  vsCodeRadioGroup,
  vsCodeTextArea,
  vsCodeTextField,
} from "@vscode/webview-ui-toolkit";

export { initWebview } from "../ui/chat/index.js";

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
  vsCodeDivider(),
  vsCodeProgressRing()
);
