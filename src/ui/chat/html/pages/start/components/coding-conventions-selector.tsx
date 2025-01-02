import { BloomComponent, component } from "bloom-router";
import { CodingConvention } from "../../../../../../settings/conventions/CodingConvention.js";

type CodingConventionsSelectorProps = {
  codingConvention: string | undefined;
  conventions: CodingConvention[];
  onChange: (value: string | undefined) => void;
};

export async function* CodingConventionsSelector(
  component: HTMLElement & BloomComponent & CodingConventionsSelectorProps
) {
  const handleChange = (e: Event) => {
    const value = (e.target as HTMLSelectElement).value;
    component.onChange(value === "None" ? undefined : value);
  };

  while (true) {
    yield (
      <div class="mb-4">
        <label class="block text-sm font-medium text-vscode-editor-foreground mb-1">
          Coding Conventions:
        </label>
        <select
          value={component.codingConvention ?? "None"}
          onchange={handleChange}
          class="w-48 px-1 py-2 bg-vscode-dropdown-background border border-vscode-dropdown-border rounded text-vscode-editor-foreground focus:outline-none focus:ring-2 focus:ring-vscode-focusBorder"
        >
          <option value="None">None</option>
          {component.conventions.map((item) => (
            <option key={item.filename} value={item.filename}>
              {item.description}
            </option>
          ))}
        </select>
      </div>
    );
  }
}

component("coding-conventions-selector", CodingConventionsSelector, {
  codingConvention: undefined,
  conventions: [],
  onChange: () => {},
});
