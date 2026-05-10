import { useState } from "react";
import { DownloadCloud, Loader2, Clock3, XCircle } from "lucide-react";
import {
  findCachedCodeforcesImport,
  getRecentCodeforcesImports,
  importCodeforcesProblem,
} from "../utils/codeforces";

export default function CodeforcesImport({ onImported, currentProblem }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [history, setHistory] = useState(() => getRecentCodeforcesImports());

  const doImport = async (value = query) => {
    const normalized = value.trim();
    if (!normalized) {
      setError("Enter a Codeforces URL or problem ID.");
      return;
    }

    setError("");
    setStatus("importing");

    try {
      const cached = findCachedCodeforcesImport(normalized);
      const problem = cached || await importCodeforcesProblem(normalized);
      setStatus(cached ? "cached" : "parsing");
      onImported(problem, { fromCache: Boolean(cached) });
      setQuery("");
      setHistory(getRecentCodeforcesImports());
      setStatus("idle");
    } catch (err) {
      setError(err.message || "Failed to import from Codeforces.");
      setStatus("failed");
    }
  };

  const busy = status === "importing" || status === "parsing";

  return (
    <div className="border-b border-[#30363d] bg-[#0d1117]">
      <div className="p-3 space-y-2">
        {currentProblem?.title && (
          <div className="rounded-md border border-[#30363d] bg-[#161b22] px-2.5 py-2">
            <div className="text-[10px] uppercase tracking-wider text-[#8b949e]">Problem</div>
            <a
              href={currentProblem.url}
              target="_blank"
              rel="noreferrer"
              className="block truncate text-xs font-semibold text-[#e6edf3] hover:text-[#58a6ff]"
              title={currentProblem.title}
            >
              {currentProblem.title}
            </a>
            <div className="mt-1 flex flex-wrap gap-2 text-[10px] text-[#8b949e]">
              <span>{currentProblem.samples?.length || 0} samples</span>
              {currentProblem.metadata?.timeLimit && <span>{currentProblem.metadata.timeLimit}</span>}
              {currentProblem.metadata?.memoryLimit && <span>{currentProblem.metadata.memoryLimit}</span>}
            </div>
          </div>
        )}

        <form
          onSubmit={(event) => {
            event.preventDefault();
            doImport();
          }}
          className="flex flex-col gap-2 sm:flex-row"
        >
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => event.stopPropagation()}
            placeholder="Codeforces URL or 71A"
            disabled={busy}
            className="min-w-0 flex-1 rounded-md border border-[#30363d] bg-[#161b22] px-2.5 py-1.5 text-xs text-[#e6edf3] placeholder-[#484f58] outline-none transition-colors focus:border-[#58a6ff] disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={busy}
            className="inline-flex items-center justify-center gap-1.5 rounded-md border border-[#30363d] bg-[#21262d] px-3 py-1.5 text-xs font-semibold text-[#e6edf3] transition-colors hover:border-[#58a6ff] hover:text-[#58a6ff] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? <Loader2 size={13} className="animate-spin" /> : <DownloadCloud size={13} />}
            {status === "importing" ? "Importing..." : status === "parsing" ? "Parsing..." : "Import from Codeforces"}
          </button>
        </form>

        {error && (
          <div className="flex items-start gap-1.5 text-[11px] text-[#f85149]">
            <XCircle size={12} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {history.length > 0 && (
          <div className="flex min-w-0 items-center gap-1.5 overflow-x-auto pb-0.5">
            <Clock3 size={11} className="shrink-0 text-[#8b949e]" />
            {history.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => doImport(item.key)}
                disabled={busy}
                className="max-w-[140px] shrink-0 truncate rounded border border-[#30363d] px-2 py-0.5 text-[10px] text-[#8b949e] hover:border-[#58a6ff] hover:text-[#58a6ff] disabled:opacity-60"
                title={item.title}
              >
                {item.key}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
