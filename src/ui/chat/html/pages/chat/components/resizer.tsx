import { component, Component } from "magic-loop";

type ResizerProps = {
  onResize: (delta: number) => void;
  handleMouseMove?: (e: MouseEvent) => void;
  handleMouseUp?: (e: MouseEvent) => void;
  frameId?: number;
};

export async function* Resizer(
  component: HTMLElement & Component & ResizerProps
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

  // Attach handlers to component so they can be referenced in onConnected/onDisconnected
  component.handleMouseMove = (e: MouseEvent) => {
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
    component.frameId = frameId;
  };

  component.handleMouseUp = () => {
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

  while (true) {
    yield (
      <div
        onmousedown={handleMouseDown}
        className={`resize-handle ${isDragging ? "dragging" : ""}`}
        style={`height: 8px; cursor: row-resize, background-color: ${
          isDragging ? "var(--vscode-focusBorder)" : "transparent"
        }, position: relative, user-select: none, touch-action: none`}
      >
        <div
          class="resize-handle-line"
          style={`position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); width: 32px; height: 4px; background-color: var(--vscode-panel-border); border-radius: 2px;`}
        />
      </div>
    );
  }
}

component(
  "resizer",
  Resizer,
  {
    onResize: () => {},
    handleMouseMove: undefined,
    handleMouseUp: undefined,
    frameId: undefined,
  },
  {
    onConnected: (component) => {
      document.addEventListener("mousemove", component.handleMouseMove!);
      document.addEventListener("mouseup", component.handleMouseUp!);
    },
    onDisconnected: (component) => {
      document.removeEventListener("mousemove", component.handleMouseMove!);
      document.removeEventListener("mouseup", component.handleMouseUp!);
      if (component.frameId) {
        cancelAnimationFrame(component.frameId);
      }
    },
  }
);
