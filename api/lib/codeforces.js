import axios from "axios";
import * as cheerio from "cheerio";

const CODEFORCES_ORIGIN = "https://codeforces.com";
const REQUEST_TIMEOUT_MS = 9000;
const MAX_QUERY_LENGTH = 180;

const recentRequests = new Map();

function normalizeIndex(index) {
  return String(index || "").trim().toUpperCase();
}

export function parseProblemQuery(raw) {
  const value = String(raw || "").trim();
  if (!value || value.length > MAX_QUERY_LENGTH) {
    throw Object.assign(new Error("Enter a valid Codeforces problem URL or ID."), { status: 400 });
  }

  if (/^https?:\/\//i.test(value)) {
    let url;
    try {
      url = new URL(value);
    } catch {
      throw Object.assign(new Error("That Codeforces URL is not valid."), { status: 400 });
    }

    if (!/^(www\.)?codeforces\.com$/i.test(url.hostname)) {
      throw Object.assign(new Error("Only codeforces.com problem URLs are supported."), { status: 400 });
    }

    const parts = url.pathname.split("/").filter(Boolean);
    let contestId;
    let index;

    if (parts[0] === "problemset" && parts[1] === "problem") {
      contestId = parts[2];
      index = parts[3];
    } else if ((parts[0] === "contest" || parts[0] === "gym") && parts[2] === "problem") {
      contestId = parts[1];
      index = parts[3];
    }

    if (!contestId || !index) {
      throw Object.assign(new Error("Use a Codeforces problem page URL, for example /problemset/problem/71/A."), { status: 400 });
    }

    return { contestId, index: normalizeIndex(index) };
  }

  const compact = value.replace(/\s+/g, "").toUpperCase();
  const match = compact.match(/^(\d{1,7})([A-Z][A-Z0-9]*)$/);
  if (!match) {
    throw Object.assign(new Error("Use a problem ID like 71A or a full Codeforces problem URL."), { status: 400 });
  }

  return { contestId: match[1], index: match[2] };
}

function buildProblemUrl({ contestId, index }) {
  return `${CODEFORCES_ORIGIN}/problemset/problem/${encodeURIComponent(contestId)}/${encodeURIComponent(index)}`;
}

function cleanText(text) {
  return String(text || "")
    .replace(/\u00a0/g, " ")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function preText($, element) {
  const clone = $(element).clone();
  clone.find("br").replaceWith("\n");
  clone.find("div").each((_, div) => {
    const current = $(div).html() || "";
    $(div).html(`${current}\n`);
  });
  return cleanText(clone.text());
}

function extractSection($, selector) {
  const section = $(selector).first();
  if (!section.length) return "";
  section.find(".section-title").remove();
  return cleanText(section.text());
}

function parseSamples($) {
  const inputs = $(".sample-test .input pre").toArray();
  const outputs = $(".sample-test .output pre").toArray();
  const count = Math.max(inputs.length, outputs.length);

  return Array.from({ length: count }, (_, i) => ({
    input: inputs[i] ? preText($, inputs[i]) : "",
    output: outputs[i] ? preText($, outputs[i]) : "",
  })).filter((sample) => sample.input || sample.output);
}

function parseMetadata($) {
  const timeLimit = cleanText($(".problem-statement .time-limit").first().text().replace(/^time limit per test/i, ""));
  const memoryLimit = cleanText($(".problem-statement .memory-limit").first().text().replace(/^memory limit per test/i, ""));
  const tags = $(".tag-box")
    .toArray()
    .map((tag) => cleanText($(tag).text()))
    .filter(Boolean);

  return { timeLimit, memoryLimit, tags };
}

export function parseProblemHtml(html, source) {
  const $ = cheerio.load(html);
  const pageTitle = cleanText($("title").first().text());
  const statement = $(".problem-statement").first();

  if (/just a moment|attention required|cloudflare/i.test(pageTitle) || !statement.length) {
    throw Object.assign(new Error("Codeforces did not return a readable problem statement. It may be blocked or temporarily unavailable."), { status: 502 });
  }

  const title = cleanText(statement.find(".header .title").first().text()) || pageTitle.replace("- Codeforces", "").trim();
  const samples = parseSamples($);

  if (!samples.length) {
    throw Object.assign(new Error("No sample testcases were found on this problem page."), { status: 422 });
  }

  return {
    source,
    title,
    samples,
    sections: {
      input: extractSection($, ".problem-statement .input-specification"),
      output: extractSection($, ".problem-statement .output-specification"),
      note: extractSection($, ".problem-statement .note"),
    },
    metadata: parseMetadata($),
  };
}

function checkRateLimit(key) {
  const now = Date.now();
  const windowMs = 60_000;
  const max = 20;
  const existing = recentRequests.get(key) || [];
  const active = existing.filter((time) => now - time < windowMs);
  active.push(now);
  recentRequests.set(key, active);

  if (active.length > max) {
    throw Object.assign(new Error("Too many import attempts. Please wait a minute and try again."), { status: 429 });
  }
}

export async function importCodeforcesProblem(rawProblem, clientKey = "anonymous") {
  checkRateLimit(clientKey);
  const problem = parseProblemQuery(rawProblem);
  const url = buildProblemUrl(problem);

  let response;
  try {
    response = await axios.get(url, {
      timeout: REQUEST_TIMEOUT_MS,
      maxRedirects: 3,
      responseType: "text",
      validateStatus: () => true,
      headers: {
        "User-Agent": "CPPad/1.0 (+https://cppad.vercel.app)",
        "Accept": "text/html,application/xhtml+xml",
      },
    });
  } catch (error) {
    const message = error.code === "ECONNABORTED"
      ? "Codeforces took too long to respond."
      : "Could not reach Codeforces. Please try again.";
    throw Object.assign(new Error(message), { status: 502 });
  }

  if (response.status === 404) {
    throw Object.assign(new Error("That Codeforces problem was not found."), { status: 404 });
  }

  if (response.status === 403 || response.status === 429 || response.status >= 500) {
    throw Object.assign(new Error("Codeforces blocked or failed the request. Try again later."), { status: 502 });
  }

  if (response.status < 200 || response.status >= 300) {
    throw Object.assign(new Error("Codeforces returned an unexpected response."), { status: 502 });
  }

  return {
    problem,
    url,
    importedAt: new Date().toISOString(),
    ...parseProblemHtml(response.data, url),
  };
}
