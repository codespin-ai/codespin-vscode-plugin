import * as React from "react";

interface ResizerProps {
  onResize: (delta: number) => void;
}

export function Resizer({ onResize }: ResizerProps) {
  const [isDragging, setIsDragging] = React.useState(false);
  const lastY = React.useRef<number>(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    lastY.current = e.clientY;
  };

  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;

      const delta = e.clientY - lastY.current;
      onResize(delta);
      lastY.current = e.clientY;
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, onResize]);

  return (
    <div
      onMouseDown={handleMouseDown}
      className={`resize-handle ${isDragging ? "dragging" : ""}`}
      style={{
        height: "8px",
        cursor: "row-resize",
        backgroundColor: isDragging
          ? "var(--vscode-focusBorder)"
          : "transparent",
        position: "relative",
        userSelect: "none",
        touchAction: "none",
      }}
    >
      <div
        className="resize-handle-line"
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          width: "32px",
          height: "4px",
          backgroundColor: "var(--vscode-panel-border)",
          borderRadius: "2px",
        }}
      />
    </div>
  );
}
