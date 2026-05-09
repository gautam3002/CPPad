const CDN = "https://cdn.jsdelivr.net/npm/monaco-themes@0.4.4/themes";

const THEME_FILES = {
  "monokai":         "Monokai.json",
  "dracula":         "Dracula.json",
  "one-dark-pro":    "One Dark Pro.json",
  "nord":            "Nord.json",
  "solarized-dark":  "Solarized-dark.json",
  "solarized-light": "Solarized-light.json",
  "ayu-dark":        "Ayu-Dark.json",
  "cobalt":          "Cobalt.json",
  "cobalt2":         "Cobalt2.json",
  "clouds-midnight": "Clouds Midnight.json",
  "tomorrow-night":  "Tomorrow-Night.json",
};

const loadedThemes = new Set(["vs-dark", "light", "hc-black", "github-dark"]);

// Returns true when theme is ready to be set, false if it failed
export async function ensureThemeLoaded(themeName, monaco) {
  if (loadedThemes.has(themeName)) return true;

  const fileName = THEME_FILES[themeName];
  if (!fileName) return false;

  try {
    const res = await fetch(`${CDN}/${encodeURIComponent(fileName)}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const themeData = await res.json();
    monaco.editor.defineTheme(themeName, themeData);
    loadedThemes.add(themeName);
    return true;
  } catch (e) {
    console.warn(`Failed to load theme "${themeName}":`, e);
    return false;
  }
}