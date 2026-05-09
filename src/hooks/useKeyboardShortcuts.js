import { useEffect } from "react";

export function useKeyboardShortcuts({ onRun, onFormat, onSnippets, onShortcuts }) {
  useEffect(() => {
    const isMac = navigator.platform.toUpperCase().includes("MAC");

    const handler = (e) => {
      const mod = isMac ? e.metaKey : e.ctrlKey;

      // Cmd/Ctrl+B → Run
      if (mod && !e.shiftKey && !e.altKey && e.key.toLowerCase() === "b") {
        e.preventDefault();
        e.stopImmediatePropagation();
        onRun?.();
        return;
      }

      // F5 → Run
      if (e.key === "F5") {
        e.preventDefault();
        e.stopImmediatePropagation();
        onRun?.();
        return;
      }

      // Cmd/Ctrl+Enter → Run
      if (mod && !e.shiftKey && e.key === "Enter") {
        e.preventDefault();
        e.stopImmediatePropagation();
        onRun?.();
        return;
      }

      // Cmd/Ctrl+S → Format
      if (mod && !e.shiftKey && e.key.toLowerCase() === "s") {
        e.preventDefault();
        e.stopImmediatePropagation();
        onFormat?.();
        return;
      }

      // Cmd/Ctrl+Shift+S → Snippets
      if (mod && e.shiftKey && e.key.toLowerCase() === "s") {
        e.preventDefault();
        e.stopImmediatePropagation();
        onSnippets?.();
        return;
      }
    };

    window.addEventListener("keydown", handler, { capture: true });
    return () => window.removeEventListener("keydown", handler, { capture: true });
  }, [onRun, onFormat, onSnippets, onShortcuts]);
}