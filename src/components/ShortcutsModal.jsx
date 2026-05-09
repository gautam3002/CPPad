import { X } from "lucide-react";
import { modLabel } from "../utils/platform";

const isMac = navigator.platform.toUpperCase().includes("MAC");

const shortcuts = [
  { category: "Running" },
  { key: modLabel("B"),                desc: "Compile & Run" },
  { key: "F5",                         desc: "Compile & Run (alternate)" },
  { key: modLabel("Enter"),            desc: "Compile & Run (alternate)" },
  { category: "Editor — Lines" },
  { key: modLabel("L"),                desc: "Select entire line" },
  { key: isMac ? "Fn+Shift+←" : "Shift+Home",  desc: "Select to line start" },
  { key: isMac ? "Fn+Shift+→" : "Shift+End",   desc: "Select to line end" },
  { key: isMac ? "Fn+←" : "Home",              desc: "Move cursor to line start" },
  { key: isMac ? "Fn+→" : "End",               desc: "Move cursor to line end" },
  { key: modLabel("Shift+K"),          desc: "Delete entire line" },
  { key: modLabel("/"),                desc: "Toggle line comment" },
  { key: modLabel("X") + " (no sel)", desc: "Cut entire line" },
  { key: modLabel("C") + " (no sel)", desc: "Copy entire line" },
  { key: "Alt+↑ / Alt+↓",             desc: "Move line up / down" },
  { key: "Alt+Shift+↑/↓",             desc: "Copy line up / down" },
  { category: "Editor — Selection" },
  { key: "Shift+↑/↓/←/→",             desc: "Extend selection" },
  { key: modLabel("A"),                desc: "Select all" },
  { key: modLabel("D"),                desc: "Select next occurrence" },
  { category: "Editor — General" },
  { key: modLabel("S"),                desc: "Format code (clang-format)" },
  { key: modLabel("Z"),                desc: "Undo" },
  { key: modLabel("Shift+Z"),          desc: "Redo" },
  { key: modLabel("F"),                desc: "Find" },
  { key: modLabel("H"),                desc: "Find & Replace" },
  { key: "Tab / Shift+Tab",            desc: "Indent / Outdent" },
  { category: "App" },
  { key: modLabel("Shift+S"),          desc: "Open Snippets" },
];

export default function ShortcutsModal({ onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-[#161b22] border border-[#30363d] rounded-xl w-full max-w-sm shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#30363d]">
          <span className="text-sm font-semibold text-[#e6edf3]">Keyboard Shortcuts</span>
          <button onClick={onClose} className="text-[#8b949e] hover:text-[#e6edf3]">
            <X size={16} />
          </button>
        </div>
        <div className="overflow-y-auto max-h-[70vh] p-3">
          {shortcuts.map((s, i) =>
            s.category ? (
              <div key={i} className="text-[10px] font-bold text-[#8b949e] uppercase tracking-widest px-2 pt-3 pb-1">
                {s.category}
              </div>
            ) : (
              <div key={i} className="flex items-center justify-between px-2 py-1.5 rounded hover:bg-[#21262d]">
                <span className="text-xs text-[#8b949e]">{s.desc}</span>
                <kbd className="text-[10px] bg-[#21262d] border border-[#30363d] text-[#e6edf3] px-1.5 py-0.5 rounded font-mono whitespace-nowrap ml-3">
                  {s.key}
                </kbd>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}