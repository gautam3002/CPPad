export const isMac = navigator.platform.toUpperCase().includes("MAC");
export const modKey = isMac ? "⌘" : "Ctrl";
export const modLabel = (key) => `${modKey} + ${key}`;