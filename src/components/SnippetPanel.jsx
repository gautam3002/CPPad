import { useState, useEffect, useRef } from "react";
import { Puzzle, Plus, Trash2, X, Check, ChevronDown } from "lucide-react";
import { DEFAULT_SNIPPETS } from "../constants/snippets";

const LS_KEY = "cpped_user_snippets";

function loadUserSnippets() {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY)) || {};
  } catch {
    return {};
  }
}

function saveUserSnippets(data) {
  localStorage.setItem(LS_KEY, JSON.stringify(data));
}

export default function SnippetPanel({ onInsert, langKey, externalOpen, onClose }) {
  const [open, setOpen]           = useState(false);
  const [userSnippets, setUserSnippets] = useState(loadUserSnippets);
  const [creating, setCreating]   = useState(false);
  const [newName, setNewName]     = useState("");
  const [newCode, setNewCode]     = useState("");
  const [nameErr, setNameErr]     = useState("");
  const panelRef = useRef(null);

  // Sync external open trigger (from keyboard shortcut)
  useEffect(() => {
    if (externalOpen) { setOpen(true); onClose?.(); }
  }, [externalOpen]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
        setCreating(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const allSnippets = [
    ...(DEFAULT_SNIPPETS[langKey] || []),
    ...(userSnippets[langKey]     || []),
  ];

  const handleInsert = (code) => {
    onInsert(code);
    setOpen(false);
    setCreating(false);
  };

  const handleCreate = () => {
    if (!newName.trim()) { setNameErr("Name is required"); return; }
    if (!newCode.trim()) { setNameErr("Code cannot be empty"); return; }

    const snippet = {
      id:   `user-${Date.now()}`,
      name: newName.trim(),
      code: newCode,
      isDefault: false,
    };

    const updated = {
      ...userSnippets,
      [langKey]: [...(userSnippets[langKey] || []), snippet],
    };
    setUserSnippets(updated);
    saveUserSnippets(updated);
    setNewName("");
    setNewCode("");
    setNameErr("");
    setCreating(false);
  };

  const handleDelete = (id) => {
    const updated = {
      ...userSnippets,
      [langKey]: (userSnippets[langKey] || []).filter((s) => s.id !== id),
    };
    setUserSnippets(updated);
    saveUserSnippets(updated);
  };

  return (
    <div className="relative" ref={panelRef}>
      {/* Trigger button */}
      <button
        onClick={() => { setOpen((v) => !v); setCreating(false); }}
        className="flex items-center gap-1.5 text-[11px] text-[#8b949e] hover:text-[#e6edf3] px-2 py-1 rounded hover:bg-[#21262d] transition-colors"
        title="Snippets"
      >
        <Puzzle size={13} />
        Snippets
        <ChevronDown size={11} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full mt-1 w-72 bg-[#161b22] border border-[#30363d] rounded-lg shadow-2xl z-50 overflow-hidden">

          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-[#30363d]">
            <span className="text-xs font-semibold text-[#e6edf3]">Snippets</span>
            <button
              onClick={() => { setCreating((v) => !v); setNameErr(""); }}
              className="flex items-center gap-1 text-[10px] text-[#58a6ff] hover:text-[#79c0ff] transition-colors"
            >
              <Plus size={12} />
              New
            </button>
          </div>

          {/* Create form */}
          {creating && (
            <div className="px-3 py-2 border-b border-[#30363d] bg-[#0d1117]">
              <input
                autoFocus
                type="text"
                placeholder="Snippet name…"
                value={newName}
                onChange={(e) => { setNewName(e.target.value); setNameErr(""); }}
                onKeyDown={(e) => e.stopPropagation()}
                className="w-full bg-[#21262d] border border-[#30363d] rounded px-2 py-1.5 text-xs text-[#e6edf3] placeholder-[#484f58] outline-none focus:border-[#58a6ff] mb-2"
              />
              <textarea
                placeholder="Paste your snippet code here…"
                value={newCode}
                onChange={(e) => setNewCode(e.target.value)}
                onKeyDown={(e) => e.stopPropagation()}
                rows={5}
                className="w-full bg-[#21262d] border border-[#30363d] rounded px-2 py-1.5 text-[11px] text-[#e6edf3] placeholder-[#484f58] outline-none focus:border-[#58a6ff] resize-none font-mono mb-2"
              />
              {nameErr && (
                <p className="text-[10px] text-[#f85149] mb-2">{nameErr}</p>
              )}
              <div className="flex gap-2">
                <button
                  onClick={handleCreate}
                  className="flex items-center gap-1 text-[11px] bg-[#238636] hover:bg-[#2ea043] text-white px-3 py-1.5 rounded transition-colors"
                >
                  <Check size={11} /> Save
                </button>
                <button
                  onClick={() => { setCreating(false); setNewName(""); setNewCode(""); setNameErr(""); }}
                  className="flex items-center gap-1 text-[11px] bg-[#21262d] hover:bg-[#30363d] text-[#8b949e] px-3 py-1.5 rounded transition-colors"
                >
                  <X size={11} /> Cancel
                </button>
              </div>
            </div>
          )}

          {/* Snippet list */}
          <div className="max-h-64 overflow-y-auto">
            {allSnippets.length === 0 ? (
              <div className="px-3 py-6 text-center text-[11px] text-[#484f58]">
                No snippets yet. Click <strong className="text-[#8b949e]">+ New</strong> to add one.
              </div>
            ) : (
              allSnippets.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between px-3 py-2 hover:bg-[#21262d] group transition-colors"
                >
                  <button
                    onClick={() => handleInsert(s.code)}
                    className="flex-1 text-left text-xs text-[#e6edf3] truncate"
                    title={s.name}
                  >
                    {s.name}
                    {s.isDefault && (
                      <span className="ml-2 text-[9px] text-[#484f58] uppercase tracking-wider">starter</span>
                    )}
                  </button>
                  {!s.isDefault && (
                    <button
                      onClick={() => handleDelete(s.id)}
                      className="opacity-0 group-hover:opacity-100 text-[#8b949e] hover:text-[#f85149] transition-all ml-2 shrink-0"
                      title="Delete snippet"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>

        </div>
      )}
    </div>
  );
}