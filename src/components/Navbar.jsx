import { Play, ChevronDown, Share2, Code2, Keyboard, Download } from "lucide-react";
import { THEMES, FONT_SIZES, LANGUAGES } from "../constants/snippets";
import { modLabel } from "../utils/platform";

export default function Navbar({
  running, onRun, onDownload,
  theme, setTheme,
  fontSize, setFontSize,
  langIndex, setLangIndex,
  onShare, onShowShortcuts,
}) {
  return (
    <nav className="flex items-center justify-between px-4 h-[52px] border-b border-[#30363d] bg-[#161b22] select-none shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <Code2 size={20} className="text-[#58a6ff]" />
        <span className="font-bold text-[#e6edf3] text-sm tracking-wide">CPPad</span>
        <span className="text-[10px] text-[#8b949e] bg-[#21262d] px-2 py-0.5 rounded-full ml-1">beta</span>
      </div>

      <div className="flex items-center gap-2">
        {/* Language */}
        <div className="relative">
          <select
            value={langIndex}
            onChange={(e) => setLangIndex(Number(e.target.value))}
            className="appearance-none bg-[#21262d] border border-[#30363d] text-[#e6edf3] text-xs px-3 py-1.5 pr-7 rounded-md cursor-pointer hover:border-[#58a6ff] transition-colors"
          >
            {LANGUAGES.map((l, i) => (
              <option key={i} value={i}>{l.label}</option>
            ))}
          </select>
          <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#8b949e] pointer-events-none" />
        </div>

        {/* Theme */}
        <div className="relative">
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            className="appearance-none bg-[#21262d] border border-[#30363d] text-[#e6edf3] text-xs px-3 py-1.5 pr-7 rounded-md cursor-pointer hover:border-[#58a6ff] transition-colors"
          >
            {THEMES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
          <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#8b949e] pointer-events-none" />
        </div>

        {/* Font Size */}
        <div className="relative">
          <select
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
            className="appearance-none bg-[#21262d] border border-[#30363d] text-[#e6edf3] text-xs px-3 py-1.5 pr-7 rounded-md cursor-pointer hover:border-[#58a6ff] transition-colors"
          >
            {FONT_SIZES.map((s) => <option key={s} value={s}>{s}px</option>)}
          </select>
          <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#8b949e] pointer-events-none" />
        </div>

        {/* Shortcuts */}
        <button
          onClick={onShowShortcuts}
          title="Keyboard Shortcuts"
          className="text-[#8b949e] hover:text-[#e6edf3] p-1.5 rounded-md hover:bg-[#21262d] transition-colors"
        >
          <Keyboard size={15} />
        </button>

        {/* Download */}
        <button
          onClick={onDownload}
          title="Download file"
          className="text-[#8b949e] hover:text-[#e6edf3] p-1.5 rounded-md hover:bg-[#21262d] transition-colors"
        >
          <Download size={15} />
        </button>

        {/* Share */}
        <button
          onClick={onShare}
          className="flex items-center gap-1.5 bg-[#21262d] border border-[#30363d] text-[#e6edf3] text-xs px-3 py-1.5 rounded-md hover:border-[#58a6ff] hover:text-[#58a6ff] transition-colors"
        >
          <Share2 size={13} />
          Share
        </button>

        {/* Run */}
        <button
          onClick={onRun}
          disabled={running}
          className={`flex items-center gap-2 text-xs font-semibold px-4 py-1.5 rounded-md transition-all ${
            running
              ? "bg-[#1f6feb]/50 text-[#58a6ff] cursor-not-allowed running"
              : "bg-[#238636] hover:bg-[#2ea043] text-white"
          }`}
        >
          <Play size={13} fill="currentColor" />
          {running ? "Running…" : `Run  ${modLabel("B")}`}
        </button>
      </div>
    </nav>
  );
}