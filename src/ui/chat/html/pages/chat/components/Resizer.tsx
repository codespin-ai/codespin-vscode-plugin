import * as React from "react";

interface ResizerProps {
  onResize: (delta: number) => void;
}

export function Resizer({ onResize }: ResizerProps) {
  const [isDragging, setIsDragging] = React.useState(false);
  const lastY = React.useRef<number>(0);
  const frameRef = React.useRef<number>(0);
  const messageListRef = React.useRef<HTMLDivElement | null>(null);
  const inputContainerRef = React.useRef<HTMLDivElement | null>(null);
  const accumulatedDelta = React.useRef<number>(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    lastY.current = e.clientY;

    // Cache references to DOM elements
    messageListRef.current = document.querySelector(".message-list-container");
    inputContainerRef.current = document.querySelector(
      ".message-input-container"
    );

    // Force GPU layers
    if (messageListRef.current && inputContainerRef.current) {
      messageListRef.current.style.transform = "translateZ(0)";
      inputContainerRef.current.style.transform = "translateZ(0)";
    }
  };

  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;

      // Cancel any pending frame
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }

      // Schedule new frame
      frameRef.current = requestAnimationFrame(() => {
        const delta = e.clientY - lastY.current;
        accumulatedDelta.current += delta;

        // Directly manipulate DOM during drag
        if (messageListRef.current && inputContainerRef.current) {
          const currentInputHeight = inputContainerRef.current.offsetHeight;
          const newHeight = currentInputHeight - delta;

          // Apply constraints
          const minHeight = 80;
          const maxHeight = window.innerHeight - 200; // Leave space for messages
          const constrainedHeight = Math.min(
            Math.max(newHeight, minHeight),
            maxHeight
          );

          inputContainerRef.current.style.height = `${constrainedHeight}px`;
        }

        lastY.current = e.clientY;
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);

      // Clean up GPU layers
      if (messageListRef.current && inputContainerRef.current) {
        messageListRef.current.style.transform = "";
        inputContainerRef.current.style.transform = "";
      }

      // Sync final height back to React only once at end of drag
      if (accumulatedDelta.current !== 0) {
        onResize(accumulatedDelta.current);
        accumulatedDelta.current = 0;
      }

      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
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
