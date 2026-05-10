const CACHE_KEY = "cppad_cf_cache";
const HISTORY_KEY = "cppad_cf_history";
const MAX_HISTORY = 6;

function readJson(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) || fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function cacheKeyFor(problem) {
  if (!problem?.contestId || !problem?.index) return null;
  return `${problem.contestId}${problem.index}`.toUpperCase();
}

export function getRecentCodeforcesImports() {
  return readJson(HISTORY_KEY, []);
}

export function rememberCodeforcesImport(problem) {
  const key = cacheKeyFor(problem.problem);
  if (!key) return;

  const cache = readJson(CACHE_KEY, {});
  cache[key] = problem;
  writeJson(CACHE_KEY, cache);

  const history = getRecentCodeforcesImports()
    .filter((item) => item.key !== key);

  history.unshift({
    key,
    title: problem.title,
    url: problem.url,
    importedAt: problem.importedAt,
    sampleCount: problem.samples?.length || 0,
  });

  writeJson(HISTORY_KEY, history.slice(0, MAX_HISTORY));
}

export function findCachedCodeforcesImport(problemId) {
  const normalized = String(problemId || "").replace(/\s+/g, "").toUpperCase();
  if (!normalized) return null;
  const cache = readJson(CACHE_KEY, {});
  return cache[normalized] || null;
}

export async function importCodeforcesProblem(problem) {
  const query = String(problem || "").trim();
  if (!query) {
    throw new Error("Enter a Codeforces URL or problem ID.");
  }

  const response = await fetch(`/api/codeforces?problem=${encodeURIComponent(query)}`);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || "Failed to import from Codeforces.");
  }

  rememberCodeforcesImport(data);
  return data;
}
