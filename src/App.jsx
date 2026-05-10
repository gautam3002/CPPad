import { useState, useCallback, useRef, useEffect } from "react";
import MonacoEditor from "@monaco-editor/react";
import { Toaster, toast } from "react-hot-toast";
import { Terminal, FlaskConical, FileCode, Copy } from "lucide-react";
import Navbar from "./components/Navbar";
import SnippetPanel from "./components/SnippetPanel";
import TestCases from "./components/TestCases";
import ShortcutsModal from "./components/ShortcutsModal";
import CodeforcesImport from "./components/CodeforcesImport";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";
import { LANGUAGES, CPP_TEMPLATE, PYTHON_TEMPLATE, JAVA_TEMPLATE } from "./constants/snippets";
import { runCode, getVerdict } from "./utils/judge0";
import { modLabel } from "./utils/platform";
import { ensureThemeLoaded } from "./utils/themes";
import { registerCppIntellisense } from "./utils/intellisense";
import { formatCode } from "./utils/formatter";

const LS_CODE   = "cpped_code";
const LS_INPUT  = "cpped_input";
const LS_LANG   = "cpped_lang";
const TEMPLATES = { cpp: CPP_TEMPLATE, python: PYTHON_TEMPLATE, java: JAVA_TEMPLATE };

function loadFromUrl() {
  try {
    const p = new URLSearchParams(window.location.search);
    if (p.get("c")) return atob(p.get("c"));
  } catch {
    return null;
  }
  return null;
}

export default function App() {
  const [code, setCode]               = useState(() => loadFromUrl() || localStorage.getItem(LS_CODE) || CPP_TEMPLATE);
  const [stdin, setStdin]             = useState(() => localStorage.getItem(LS_INPUT) || "");
  const [output, setOutput]           = useState({ text: "", type: "idle" });
  const [running, setRunning]         = useState(false);
  const [theme, setTheme]             = useState("github-dark");
  const [fontSize, setFontSize]       = useState(14);
  const [langIndex, setLangIndex]     = useState(() => { const s = localStorage.getItem(LS_LANG); return s ? parseInt(s) : 0; });
  const [tab, setTab]                 = useState("io");
  const [metrics, setMetrics]         = useState(null);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [snippetOpen, setSnippetOpen] = useState(false);
  const [importedCases, setImportedCases] = useState(null);
  const [importVersion, setImportVersion] = useState(0);
  const [currentProblem, setCurrentProblem] = useState(null);
  const editorRef  = useRef(null);
  const monacoRef  = useRef(null);
  const runningRef = useRef(false);

  const currentLang = LANGUAGES[langIndex] || LANGUAGES[0];

  useEffect(() => { localStorage.setItem(LS_CODE,  code);      }, [code]);
  useEffect(() => { localStorage.setItem(LS_INPUT, stdin);     }, [stdin]);
  useEffect(() => { localStorage.setItem(LS_LANG,  langIndex); }, [langIndex]);

  useEffect(() => {
    if (!monacoRef.current) return;
    ensureThemeLoaded(theme, monacoRef.current).then((ready) => {
      if (ready) monacoRef.current.editor.setTheme(theme);
    });
  }, [theme]);

  const handleRun = useCallback(async () => {
    if (runningRef.current) return;
    runningRef.current = true;
    setRunning(true);
    setOutput({ text: "", type: "running" });
    setMetrics(null);
    setTab("io");
    try {
      const result = await runCode({
        code,
        stdin,
        languageId: currentLang.value,
        compilerOptions: currentLang.compilerOptions,
      });
      const verdict = getVerdict(result.status.id);
      if (result.compileOutput) {
        setOutput({ text: result.compileOutput, type: "error" });
        toast.error("Compilation Error");
      } else if (result.stderr && result.status.id !== 3) {
        setOutput({ text: result.stderr, type: "error" });
        toast.error(verdict.desc || "Runtime Error");
      } else {
        setOutput({ text: result.stdout || "(no output)", type: "success" });
        setMetrics({ time: result.time, memory: result.memory, verdict });
        toast.success(`${verdict.desc} · ${result.time}s · ${result.memory}KB`);
      }
    } catch (e) {
      setOutput({ text: e.message, type: "error" });
      toast.error(e.message);
    }
    runningRef.current = false;
    setRunning(false);
  }, [code, stdin, currentLang]);

  // Format using clang-format WASM — preserves undo stack
  const handleFormat = useCallback(async () => {
    const editor = editorRef.current;
    const monaco = monacoRef.current;
    if (!editor || !monaco) return;
    try {
      const formatted = await formatCode(code, currentLang.template);
      const model = editor.getModel();
      const fullRange = model.getFullModelRange();
      // pushEditOperations preserves the undo stack
      editor.pushUndoStop();
      editor.executeEdits("clang-format", [{
        range: fullRange,
        text: formatted,
        forceMoveMarkers: true,
      }]);
      editor.pushUndoStop();
    } catch (e) {
      toast.error(`Format failed: ${e.message}`, { id: "fmt" });
    }
  }, [code, currentLang]);

  const handleDownload = useCallback(() => {
    const blob = new Blob([code], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `main.${currentLang?.ext || "cpp"}`;
    a.click();
    toast.success("Downloaded!");
  }, [code, currentLang]);

  useKeyboardShortcuts({
    onRun: handleRun,
    onFormat: handleFormat,
    onSnippets: () => setSnippetOpen(true),
    onShortcuts: () => setShowShortcuts((v) => !v),
  });

  const handleLangChange = (newIndex) => {
    const newLang = LANGUAGES[newIndex];
    const oldLang = LANGUAGES[langIndex];
    setLangIndex(newIndex);
    if (newLang && oldLang && newLang.template !== oldLang.template) {
      setCode(TEMPLATES[newLang.template] || CPP_TEMPLATE);
      toast.success(`Loaded ${newLang.label} template`);
    }
  };

  const handleCodeforcesImported = (problem, { fromCache = false } = {}) => {
    const sampleCases = (problem.samples || []).map((sample) => ({
      input: sample.input,
      expected: sample.output,
    }));

    const previousKey = currentProblem?.problem
      ? `${currentProblem.problem.contestId}${currentProblem.problem.index}`.toUpperCase()
      : "";
    const nextKey = problem.problem
      ? `${problem.problem.contestId}${problem.problem.index}`.toUpperCase()
      : "";

    setCurrentProblem(problem);
    setImportedCases(sampleCases);
    setImportVersion((version) => version + 1);
    if (!stdin.trim() && sampleCases[0]?.input) {
      setStdin(sampleCases[0].input);
    }
    setTab("cases");

    if (previousKey && previousKey === nextKey) {
      toast.success("Codeforces samples refreshed");
    } else {
      toast.success(`${fromCache ? "Loaded cached" : "Imported"} ${problem.title}`);
    }
  };

  const handleEditorMount = (editor, monaco) => {
  editorRef.current = editor;
  monacoRef.current = monaco;

  monaco.editor.defineTheme("github-dark", {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "comment",  foreground: "8b949e", fontStyle: "italic" },
      { token: "keyword",  foreground: "ff7b72" },
      { token: "string",   foreground: "a5d6ff" },
      { token: "number",   foreground: "79c0ff" },
      { token: "type",     foreground: "ffa657" },
      { token: "function", foreground: "d2a8ff" },
      { token: "variable", foreground: "e6edf3" },
      { token: "operator", foreground: "ff7b72" },
    ],
    colors: {
      "editor.background":                  "#0d1117",
      "editor.foreground":                  "#e6edf3",
      "editor.lineHighlightBackground":     "#161b22",
      "editorLineNumber.foreground":        "#484f58",
      "editorLineNumber.activeForeground":  "#e6edf3",
      "editor.selectionBackground":         "#264f7840",
      "editorCursor.foreground":            "#58a6ff",
      "editor.inactiveSelectionBackground": "#1f2937",
    },
  });
  monaco.editor.setTheme("github-dark");
  registerCppIntellisense(monaco);

  // Cmd+L → select entire current line
  editor.addAction({
    id: "select-current-line",
    label: "Select Current Line",
    keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyL],
    run: (ed) => {
      const pos     = ed.getPosition();
      const model   = ed.getModel();
      const lineLen = model.getLineLength(pos.lineNumber);
      ed.setSelection(
        new monaco.Range(pos.lineNumber, 1, pos.lineNumber, lineLen + 1)
      );
    },
  });

  // Intercept Cmd+← and Cmd+Shift+← directly on the editor DOM node
  // macOS grabs these before Monaco sees them — we re-fire as Monaco commands
  const editorDom = editor.getDomNode();
  if (editorDom) {
    editorDom.addEventListener("keydown", (e) => {
      const isMac = navigator.platform.toUpperCase().includes("MAC");
      const mod   = isMac ? e.metaKey : e.ctrlKey;
      if (!mod) return;

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        e.stopImmediatePropagation();
        if (e.shiftKey) {
          editor.trigger("keyboard", "cursorHomeSelect", {});
        } else {
          editor.trigger("keyboard", "cursorHome", {});
        }
        return;
      }

      if (e.key === "ArrowRight") {
        e.preventDefault();
        e.stopImmediatePropagation();
        if (e.shiftKey) {
          editor.trigger("keyboard", "cursorEndSelect", {});
        } else {
          editor.trigger("keyboard", "cursorEnd", {});
        }
        return;
      }

      if (e.key === "ArrowUp") {
        e.preventDefault();
        e.stopImmediatePropagation();
        if (e.shiftKey) {
          editor.trigger("keyboard", "cursorTopSelect", {});
        } else {
          editor.trigger("keyboard", "cursorTop", {});
        }
        return;
      }

      if (e.key === "ArrowDown") {
        e.preventDefault();
        e.stopImmediatePropagation();
        if (e.shiftKey) {
          editor.trigger("keyboard", "cursorBottomSelect", {});
        } else {
          editor.trigger("keyboard", "cursorBottom", {});
        }
        return;
      }
    }, true); // capture:true — fires before macOS swallows it
  }
};

  const insertSnippet = (snippet) => {
    if (editorRef.current) {
      const selection = editorRef.current.getSelection();
      editorRef.current.executeEdits("snippet", [{ range: selection, text: snippet, forceMoveMarkers: true }]);
      editorRef.current.focus();
    }
  };

  const handleShare = () => {
    const url = `${window.location.origin}${window.location.pathname}?c=${btoa(unescape(encodeURIComponent(code)))}`;
    navigator.clipboard.writeText(url).then(() => toast.success("Link copied!"));
  };

  const getFileName = () => `main.${currentLang?.ext || "cpp"}`;

  return (
    <div className="flex flex-col h-screen bg-[#0d1117] overflow-hidden">
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: "#161b22", color: "#e6edf3", border: "1px solid #30363d", fontSize: "12px" },
          duration: 3000,
        }}
      />

      <Navbar
        running={running}
        onRun={handleRun}
        onDownload={handleDownload}
        theme={theme}
        setTheme={setTheme}
        fontSize={fontSize}
        setFontSize={setFontSize}
        langIndex={langIndex}
        setLangIndex={handleLangChange}
        onShare={handleShare}
        onShowShortcuts={() => setShowShortcuts(true)}
      />

      {showShortcuts && <ShortcutsModal onClose={() => setShowShortcuts(false)} />}

      <div className="split-pane flex-1 min-h-0">

        {/* ── LEFT: Editor ── */}
        <div className="editor-pane" style={{ width: "60%" }}>
          <div className="flex items-center px-3 py-1 bg-[#161b22] border-b border-[#30363d] gap-2 shrink-0">
            <FileCode size={12} className="text-[#8b949e]" />
            <span className="text-xs text-[#8b949e]">{getFileName()}</span>
            <div className="ml-auto">
              <SnippetPanel
                onInsert={insertSnippet}
                langKey={currentLang?.template || "cpp"}
                externalOpen={snippetOpen}
                onClose={() => setSnippetOpen(false)}
              />
            </div>
          </div>

          <div className="flex-1 min-h-0">
            <MonacoEditor
              height="100%"
              language={currentLang?.monacoLang || "cpp"}
              value={code}
              theme={theme}
              onChange={(v) => setCode(v || "")}
              onMount={handleEditorMount}
              options={{
                fontSize,
                minimap: { enabled: false },
                formatOnPaste: false,
                formatOnType: false,
                tabSize: 4,
                wordWrap: "off",
                scrollBeyondLastLine: false,
                automaticLayout: true,
                fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
                fontLigatures: true,
                bracketPairColorization: { enabled: true },
                guides: { bracketPairs: true },
                renderLineHighlight: "all",
                cursorBlinking: "smooth",
                smoothScrolling: true,
                padding: { top: 12 },
                suggestOnTriggerCharacters: true,
                quickSuggestions: { other: true, comments: false, strings: false },
                acceptSuggestionOnEnter: "on",
                tabCompletion: "on",
                wordBasedSuggestions: "allDocuments",
                parameterHints: { enabled: true },
                hover: { enabled: true, delay: 300 },
                renderValidationDecorations: "on",
              }}
            />
          </div>

          {/* Status bar */}
          <div className="flex items-center justify-between px-3 py-1 bg-[#161b22] border-t border-[#30363d] text-[10px] text-[#8b949e] shrink-0">
            <div className="flex items-center gap-3">
              <span>{currentLang?.label}</span>
              {currentLang?.compilerOptions && (
                <span className="text-[#484f58] font-mono">{currentLang.compilerOptions}</span>
              )}
              <span>UTF-8</span>
            </div>
            <div className="flex items-center gap-3">
              {metrics && (
                <>
                  <span className={`font-bold px-1.5 py-0.5 rounded text-[9px] ${metrics.verdict.cls}`}>
                    {metrics.verdict.label}
                  </span>
                  <span>⏱ {metrics.time}s</span>
                  <span>💾 {metrics.memory} KB</span>
                </>
              )}
              <span>{modLabel("B")} run · {modLabel("S")} format</span>
            </div>
          </div>
        </div>

        {/* ── RIGHT: I/O ── */}
        <div className="right-pane" style={{ width: "40%" }}>
          <div className="flex border-b border-[#30363d] shrink-0">
            {[
              { id: "io",    icon: <Terminal size={12} />,     label: "I/O" },
              { id: "cases", icon: <FlaskConical size={12} />, label: "Test Cases" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-1.5 text-xs px-4 py-2.5 border-b-2 transition-colors ${
                  tab === t.id
                    ? "border-[#58a6ff] text-[#58a6ff]"
                    : "border-transparent text-[#8b949e] hover:text-[#e6edf3]"
                }`}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          {tab === "io" ? (
            <>
              <div className="io-section" style={{ flex: "0 0 38%" }}>
                <div className="px-3 py-1.5 border-b border-[#30363d] shrink-0">
                  <span className="text-[10px] font-semibold text-[#8b949e] uppercase tracking-wider">
                    stdin / Input
                  </span>
                </div>
                <textarea
                  value={stdin}
                  onChange={(e) => setStdin(e.target.value)}
                  onKeyDown={(e) => e.stopPropagation()}
                  placeholder="Paste your input here…"
                  className="flex-1 w-full bg-transparent text-[#e6edf3] placeholder-[#484f58] p-3 resize-none outline-none font-mono text-[13px]"
                  spellCheck={false}
                />
              </div>

              <div className="io-section flex-1">
                <div className="flex items-center justify-between px-3 py-1.5 border-b border-[#30363d] shrink-0">
                  <span className="text-[10px] font-semibold text-[#8b949e] uppercase tracking-wider">
                    Output
                  </span>
                  {output.text && output.type !== "running" && (
                    <button
                      onClick={() => { navigator.clipboard.writeText(output.text); toast.success("Copied"); }}
                      className="text-[#8b949e] hover:text-[#e6edf3] transition-colors"
                    >
                      <Copy size={11} />
                    </button>
                  )}
                </div>
                <pre
                  className={`flex-1 p-3 text-[12px] font-mono overflow-auto whitespace-pre-wrap break-words ${
                    output.type === "error"   ? "text-[#f85149]" :
                    output.type === "running" ? "text-[#8b949e] running" :
                    output.type === "success" ? "text-[#3fb950]" :
                                                "text-[#484f58]"
                  }`}
                >
                  {output.type === "idle"    ? `Press ${modLabel("B")} or click Run…` :
                   output.type === "running" ? "Compiling and running…" :
                   output.text}
                </pre>
              </div>
            </>
          ) : (
            <div className="flex flex-1 min-h-0 flex-col overflow-hidden">
              <CodeforcesImport
                onImported={handleCodeforcesImported}
                currentProblem={currentProblem}
              />
              <TestCases
                key={importVersion}
                code={code}
                langId={currentLang.value}
                compilerOptions={currentLang.compilerOptions}
                importedCases={importedCases}
              />
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
