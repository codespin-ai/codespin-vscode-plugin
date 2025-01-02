import { BloomComponent, component } from "bloom-router";

type ResizerProps = {
  onResize: (delta: number) => void;
};

export async function* Resizer(
  component: HTMLElement & BloomComponent & ResizerProps
) {
  let isDragging = false;
  let lastY = 0;
  let frameId = 0;
  let messageListRef: HTMLDivElement | null = null;
  let inputContainerRef: HTMLDivElement | null = null;
  let accumulatedDelta = 0;

  const handleMouseDown = (e: MouseEvent) => {
    isDragging = true;
    lastY = e.clientY;

    messageListRef = document.querySelector(".message-list-container");
    inputContainerRef = document.querySelector(".message-input-container");

    if (messageListRef && inputContainerRef) {
      messageListRef.style.transform = "translateZ(0)";
      inputContainerRef.style.transform = "translateZ(0)";
    }
    component.render();
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;

    if (frameId) {
      cancelAnimationFrame(frameId);
    }

    frameId = requestAnimationFrame(() => {
      const delta = e.clientY - lastY;
      accumulatedDelta += delta;

      if (messageListRef && inputContainerRef) {
        const currentInputHeight = inputContainerRef.offsetHeight;
        const newHeight = currentInputHeight - delta;

        const minHeight = 80;
        const maxHeight = window.innerHeight - 200;
        const constrainedHeight = Math.min(
          Math.max(newHeight, minHeight),
          maxHeight
        );

        inputContainerRef.style.height = `${constrainedHeight}px`;
        lastY = e.clientY;
      }
      component.render();
    });
  };

  const handleMouseUp = () => {
    isDragging = false;

    if (messageListRef && inputContainerRef) {
      messageListRef.style.transform = "";
      inputContainerRef.style.transform = "";
    }

    if (accumulatedDelta !== 0) {
      component.onResize(accumulatedDelta);
      accumulatedDelta = 0;
    }

    if (frameId) {
      cancelAnimationFrame(frameId);
    }
    component.render();
  };

  // Add event listeners
  document.addEventListener("mousemove", handleMouseMove);
  document.addEventListener("mouseup", handleMouseUp);

  // Cleanup on component destroy
  component.cleanup = () => {
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
    if (frameId) {
      cancelAnimationFrame(frameId);
    }
  };

  while (true) {
    yield (
      <div
        onmousedown={handleMouseDown}
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
          class="resize-handle-line"
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
}

component("resizer", Resizer, {
  onResize: () => {},
});
