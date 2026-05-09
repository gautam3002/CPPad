const JUDGE0_BASE = "https://ce.judge0.com";
const headers = { "Content-Type": "application/json" };

function b64(str) {
  return btoa(unescape(encodeURIComponent(str)));
}
function deb64(str) {
  if (!str) return "";
  try { return decodeURIComponent(escape(atob(str))); }
  catch { return str; }
}

export async function runCode({ code, stdin = "", languageId = "12", compilerOptions = "-std=c++17 -O2" }) {
  const body = {
    source_code: b64(code),
    stdin: b64(stdin),
    language_id: parseInt(languageId),
    cpu_time_limit: 10,
    memory_limit: 262144,
  };

  // Only add compiler_options if non-empty — avoids sending empty string to Python/Java
  if (compilerOptions && compilerOptions.trim() !== "") {
    body.compiler_options = compilerOptions;
  }

  const submitRes = await fetch(`${JUDGE0_BASE}/submissions?base64_encoded=true&wait=false`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  if (!submitRes.ok) {
    const err = await submitRes.text();
    throw new Error(`Submission failed: ${err}`);
  }

  const { token } = await submitRes.json();

  for (let i = 0; i < 25; i++) {
    await new Promise((r) => setTimeout(r, 800));
    const res = await fetch(
      `${JUDGE0_BASE}/submissions/${token}?base64_encoded=true&fields=stdout,stderr,compile_output,status,time,memory`,
      { headers }
    );
    const data = await res.json();
    if (data.status?.id >= 3) {
      return {
        stdout: deb64(data.stdout),
        stderr: deb64(data.stderr),
        compileOutput: deb64(data.compile_output),
        status: data.status,
        time: data.time,
        memory: data.memory,
      };
    }
  }
  throw new Error("Execution timed out after 20s");
}

export function getVerdict(statusId) {
  const map = {
    3:  { label: "AC",  cls: "badge-ac",  desc: "Accepted" },
    4:  { label: "WA",  cls: "badge-wa",  desc: "Wrong Answer" },
    5:  { label: "TLE", cls: "badge-tle", desc: "Time Limit Exceeded" },
    6:  { label: "CE",  cls: "badge-ce",  desc: "Compilation Error" },
    7:  { label: "RE",  cls: "badge-re",  desc: "Runtime Error (SIGSEGV)" },
    8:  { label: "RE",  cls: "badge-re",  desc: "Runtime Error (SIGFPE)" },
    9:  { label: "RE",  cls: "badge-re",  desc: "Runtime Error (SIGABRT)" },
    10: { label: "RE",  cls: "badge-re",  desc: "Runtime Error (NZEC)" },
    11: { label: "RE",  cls: "badge-re",  desc: "Runtime Error (Other)" },
    12: { label: "RE",  cls: "badge-re",  desc: "Runtime Error (Internal)" },
    13: { label: "RE",  cls: "badge-re",  desc: "Exec Format Error" },
  };
  return map[statusId] || { label: "ERR", cls: "badge-re", desc: "Unknown Error" };
}