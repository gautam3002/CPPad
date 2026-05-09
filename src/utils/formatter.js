import wasmUrl from "@wasm-fmt/clang-format/clang-format.wasm?url";

let formatFn = null;

async function ensureLoaded() {
  if (formatFn) return;
  const mod = await import("@wasm-fmt/clang-format/clang-format-web.js");
  await mod.default(wasmUrl);
  formatFn = mod.format;
}

const CP_STYLE = JSON.stringify({
  BasedOnStyle: "Google",
  IndentWidth: 4,
  TabWidth: 4,
  UseTab: "Never",
  ColumnLimit: 100,
  AllowShortFunctionsOnASingleLine: "None",
  AllowShortIfStatementsOnASingleLine: "Never",
  AllowShortLoopsOnASingleLine: false,
  BreakBeforeBraces: "Attach",
  SpaceBeforeParens: "ControlStatements",
  MaxEmptyLinesToKeep: 1,
  KeepEmptyLinesAtTheStartOfBlocks: false,
  SortIncludes: "Never",
});

function formatPython(code) {
  return code
    .split("\n")
    .map((l) => l.trimEnd())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trimEnd() + "\n";
}

export async function formatCode(code, langTemplate) {
  if (langTemplate === "python") return formatPython(code);

  try {
    await ensureLoaded();
    const filename = langTemplate === "java" ? "file.java" : "file.cpp";
    return formatFn(code, filename, CP_STYLE);
  } catch (e) {
    throw new Error(e.message || "Format failed");
  }
}