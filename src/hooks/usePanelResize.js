import { useCallback, useRef, useState } from "react";

export function usePanelResize(initialPercent, min = 15, max = 85) {
  const [percent, setPercent] = useState(initialPercent);
  const dragging = useRef(false);

  const onMouseDown = useCallback((e, axis, containerRef) => {
    e.preventDefault();
    dragging.current = true;
    document.body.style.cursor = axis === "x" ? "col-resize" : "row-resize";
    document.body.style.userSelect = "none";

    const onMove = (ev) => {
      if (!dragging.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const raw = axis === "x"
        ? ((ev.clientX - rect.left) / rect.width) * 100
        : ((ev.clientY - rect.top) / rect.height) * 100;
      setPercent(Math.min(max, Math.max(min, raw)));
    };

    const onUp = () => {
      dragging.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }, [min, max]);

  const reset = useCallback(() => setPercent(initialPercent), [initialPercent]);

  return [percent, onMouseDown, reset];
}