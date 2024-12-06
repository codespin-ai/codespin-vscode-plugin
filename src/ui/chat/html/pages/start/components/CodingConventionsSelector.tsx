import * as React from "react";
import { CodingConvention } from "../../../../../../settings/conventions/CodingConvention.js";

interface CodingConventionsSelectorProps {
  codingConvention: string | undefined;
  conventions: CodingConvention[];
  onChange: (value: string | undefined) => void;
}

export function CodingConventionsSelector({
  codingConvention,
  conventions,
  onChange,
}: CodingConventionsSelectorProps) {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value === "None" ? undefined : e.target.value);
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-vscode-editor-foreground mb-1">
        Coding Conventions:
      </label>
      <select
        value={codingConvention ?? "None"}
        onChange={handleChange}
        className="w-48 px-1 py-2 bg-vscode-dropdown-background border border-vscode-dropdown-border rounded text-vscode-editor-foreground focus:outline-none focus:ring-2 focus:ring-vscode-focusBorder"
      >
        <option value="None">None</option>
        {conventions.map((item) => (
          <option key={item.filename} value={item.filename}>
            {item.description}
          </option>
        ))}
      </select>
    </div>
  );
}
