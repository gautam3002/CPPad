import { useEffect, useRef } from "react";
import { ExternalLink } from "lucide-react";

// Load MathJax once
function loadMathJax() {
  if (window.MathJax || document.getElementById("mathjax-script")) return;
  window.MathJax = {
    tex: { inlineMath: [["$", "$"], ["\\(", "\\)"]], displayMath: [["$$", "$$"], ["\\[", "\\]"]] },
    svg: { fontCache: "global" },
    startup: { typeset: false },
  };
  const script = document.createElement("script");
  script.id = "mathjax-script";
  script.src = "https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js";
  script.async = true;
  document.head.appendChild(script);
}

function typeset(el) {
  if (!el) return;
  const tryTypeset = () => {
    if (window.MathJax?.typesetPromise) {
      window.MathJax.typesetPromise([el]).catch(console.warn);
    } else {
      setTimeout(tryTypeset, 300);
    }
  };
  tryTypeset();
}

export default function ProblemStatement({ problem }) {
  const bodyRef   = useRef(null);
  const inputRef  = useRef(null);
  const outputRef = useRef(null);
  const noteRef   = useRef(null);

  useEffect(() => { loadMathJax(); }, []);

  useEffect(() => {
    if (!problem) return;
    typeset(bodyRef.current);
    typeset(inputRef.current);
    typeset(outputRef.current);
    typeset(noteRef.current);
  }, [problem]);

  if (!problem) {
    return (
      <div className="flex flex-1 items-center justify-center text-[#484f58] text-xs p-4 text-center">
        Import a Codeforces problem to view its statement
      </div>
    );
  }

  const { title, url, body, sections, metadata, samples } = problem;

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 text-[12px] leading-relaxed cf-statement">

      {/* Header */}
      <div className="border-b border-[#30363d] pb-3">
        <div className="flex items-start justify-between gap-2">
          <h2 className="text-sm font-bold text-[#e6edf3]">{title}</h2>
          <a href={url} target="_blank" rel="noreferrer"
            className="shrink-0 text-[#8b949e] hover:text-[#58a6ff] transition-colors mt-0.5">
            <ExternalLink size={13} />
          </a>
        </div>
        <div className="flex flex-wrap gap-3 mt-1.5 text-[10px] text-[#8b949e]">
          {metadata?.timeLimit   && <span>⏱ {metadata.timeLimit}</span>}
          {metadata?.memoryLimit && <span>💾 {metadata.memoryLimit}</span>}
          {metadata?.tags?.length > 0 && <span>{metadata.tags.join(", ")}</span>}
        </div>
      </div>

      {/* Problem body */}
      {body && (
        <Section title="Problem">
          <div ref={bodyRef}
            className="cf-html text-[#c9d1d9]"
            dangerouslySetInnerHTML={{ __html: body }}
          />
        </Section>
      )}

      {/* Input spec */}
      {(sections?.inputHtml || sections?.input) && (
        <Section title="Input">
          <div ref={inputRef}
            className="cf-html text-[#c9d1d9]"
            dangerouslySetInnerHTML={{ __html: sections.inputHtml || sections.input }}
          />
        </Section>
      )}

      {/* Output spec */}
      {(sections?.outputHtml || sections?.output) && (
        <Section title="Output">
          <div ref={outputRef}
            className="cf-html text-[#c9d1d9]"
            dangerouslySetInnerHTML={{ __html: sections.outputHtml || sections.output }}
          />
        </Section>
      )}

      {/* Samples */}
      {samples?.length > 0 && (
        <Section title="Examples">
          {samples.map((s, i) => (
            <div key={i} className="mb-3">
              <div className="text-[10px] text-[#8b949e] mb-1">Example {i + 1}</div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <div className="text-[9px] uppercase tracking-wider text-[#8b949e] mb-1">Input</div>
                  <pre className="bg-[#161b22] border border-[#30363d] rounded p-2 text-[11px] text-[#e6edf3] whitespace-pre-wrap overflow-x-auto">
                    {s.input}
                  </pre>
                </div>
                <div>
                  <div className="text-[9px] uppercase tracking-wider text-[#8b949e] mb-1">Output</div>
                  <pre className="bg-[#161b22] border border-[#30363d] rounded p-2 text-[11px] text-[#e6edf3] whitespace-pre-wrap overflow-x-auto">
                    {s.output}
                  </pre>
                </div>
              </div>
            </div>
          ))}
        </Section>
      )}

      {/* Note */}
      {(sections?.noteHtml || sections?.note) && (
        <Section title="Note">
          <div ref={noteRef}
            className="cf-html text-[#c9d1d9]"
            dangerouslySetInnerHTML={{ __html: sections.noteHtml || sections.note }}
          />
        </Section>
      )}

    </div>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <div className="text-[10px] font-bold uppercase tracking-wider text-[#8b949e] mb-1.5">{title}</div>
      {children}
    </div>
  );
}