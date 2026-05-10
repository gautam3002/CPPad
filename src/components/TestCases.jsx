import { useState } from "react";
import { Plus, Trash2, Play, CheckCircle2, XCircle } from "lucide-react";
import { runCode } from "../utils/judge0";

export default function TestCases({ code, langId, compilerOptions, importedCases }) {
  const [cases, setCases] = useState(() => {
    if (importedCases?.length) {
      return importedCases.map((tc, index) => ({
        id: `${Date.now()}-${index}`,
        input: tc.input || "",
        expected: tc.expected || "",
        output: "",
        status: null,
      }));
    }

    return [{ id: 1, input: "", expected: "", output: "", status: null }];
  });
  const [running, setRunning] = useState(false);

  const addCase = () =>
    setCases((c) => [...c, { id: Date.now(), input: "", expected: "", output: "", status: null }]);

  const removeCase = (id) => setCases((c) => c.filter((t) => t.id !== id));

  const update = (id, field, val) =>
    setCases((c) => c.map((t) => (t.id === id ? { ...t, [field]: val } : t)));

  const runAll = async () => {
    setRunning(true);
    const updated = await Promise.all(
      cases.map(async (tc) => {
        try {
          const res = await runCode({ code, stdin: tc.input, languageId: langId, compilerOptions });
          const actual = res.stdout || res.stderr || res.compileOutput || "";
          const pass =
            tc.expected.trim() === "" || actual.trim() === tc.expected.trim();
          return { ...tc, output: actual, status: pass ? "pass" : "fail" };
        } catch {
          return { ...tc, output: "Error", status: "fail" };
        }
      })
    );
    setCases(updated);
    setRunning(false);
  };

  return (
    <div className="flex flex-1 min-h-0 flex-col">
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#30363d] shrink-0">
        <span className="text-xs font-semibold text-[#8b949e] uppercase tracking-wider">
          Test Cases
        </span>
        <div className="flex gap-1">
          <button onClick={addCase} className="text-[#8b949e] hover:text-[#58a6ff] p-1">
            <Plus size={14} />
          </button>
          <button
            onClick={runAll}
            disabled={running}
            className="flex items-center gap-1 text-[10px] font-semibold bg-[#1f6feb] hover:bg-[#388bfd] text-white px-2 py-1 rounded transition-colors disabled:opacity-50"
          >
            <Play size={10} fill="currentColor" />
            {running ? "…" : "Run All"}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {cases.map((tc, i) => (
          <div key={tc.id} className="border-b border-[#30363d] p-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-[#8b949e] font-medium">Case {i + 1}</span>
              <div className="flex items-center gap-1">
                {tc.status === "pass" && <CheckCircle2 size={12} className="text-[#3fb950]" />}
                {tc.status === "fail" && <XCircle size={12} className="text-[#f85149]" />}
                {cases.length > 1 && (
                  <button
                    onClick={() => removeCase(tc.id)}
                    className="text-[#8b949e] hover:text-[#f85149]"
                  >
                    <Trash2 size={11} />
                  </button>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-1 mb-1">
              <div>
                <div className="text-[9px] text-[#8b949e] mb-0.5">Input</div>
                <textarea
                  value={tc.input}
                  onChange={(e) => update(tc.id, "input", e.target.value)}
                  onKeyDown={(e) => e.stopPropagation()}
                  placeholder="stdin…"
                  rows={2}
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded p-1.5 text-[11px] text-[#e6edf3] placeholder-[#484f58] resize-none outline-none font-mono"
                />
              </div>
              <div>
                <div className="text-[9px] text-[#8b949e] mb-0.5">Expected</div>
                <textarea
                  value={tc.expected}
                  onChange={(e) => update(tc.id, "expected", e.target.value)}
                  onKeyDown={(e) => e.stopPropagation()}
                  placeholder="expected…"
                  rows={2}
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded p-1.5 text-[11px] text-[#e6edf3] placeholder-[#484f58] resize-none outline-none font-mono"
                />
              </div>
            </div>
            {tc.output && (
              <div>
                <div className="text-[9px] text-[#8b949e] mb-0.5">Output</div>
                <pre
                  className={`text-[11px] p-1.5 rounded border font-mono whitespace-pre-wrap ${
                    tc.status === "pass"
                      ? "bg-[#0d2b1a] border-[#1a4731] text-[#3fb950]"
                      : "bg-[#2d1215] border-[#4a1c1c] text-[#f85149]"
                  }`}
                >
                  {tc.output.slice(0, 300)}
                </pre>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
