import { diffChars, Change } from "diff";

export function diffContent(maybeFrom: string | undefined, to: string): string {
  const from = maybeFrom ?? "";
  const diff = diffChars(from, to);
  let html = "";

  diff.forEach((part: Change) => {
    // Determine color based on the type of change.
    const color = part.added ? "green" : part.removed ? "red" : "grey";

    // Escape HTML special characters to prevent XSS or other injection attacks.
    let escapedValue = escapeHtml(part.value);

    // Replace newline characters with <br> tags to preserve line breaks.
    escapedValue = escapedValue.replace(/\n/g, "<br>");

    // Append a span for this part of the diff to our HTML string, with appropriate styling.
    html += `<span style="color: ${color};">${escapedValue}</span>`;
  });

  return html;
}

// Helper function to escape HTML special characters.
function escapeHtml(unsafeText: string): string {
  return unsafeText
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
