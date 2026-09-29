/**
 * Deterministic heuristic parser backing `POST /api/ai/parse`.
 * Stands in for a hosted LLM: extracts a `NewHackathon`-shaped draft plus
 * extras from pasted text or fetched page text. Pure — no I/O, no secrets.
 */

export interface HackathonDraft {
  name: string;
  organizer: string | null;
  location: string | null;
  isRemote: boolean;
  startDate: string | null;
  endDate: string | null;
  applicationDeadline: string | null;
  url: string | null;
  status: "reviewing";
  result: "none";
  rank: null;
  prize: string | null;
  technologies: string[];
  teamMembers: [];
  projectName: null;
  projectUrl: null;
  repoUrl: null;
  notes: string | null;
  learnings: null;
}

export interface DraftExtras {
  prizeAmount: string | null;
  techHints: string[];
}

export interface ParsedDraft {
  draft: HackathonDraft;
  extras: DraftExtras;
}

const URL_RE = /https?:\/\/[^\s"'<>)]+/gi;
const ISO_DATE_RE = /\b(20\d{2})-(\d{2})-(\d{2})\b/;
const LONG_DATE_RE =
  /\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2})(?:\s*[-–]\s*(\d{1,2}))?,?\s+(20\d{2})/i;
const SHORT_DATE_RE =
  /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{1,2})(?:\s*[-–]\s*(\d{1,2}))?,?\s+(20\d{2})/i;

const MONTHS: Record<string, string> = {
  january: "01",
  february: "02",
  march: "03",
  april: "04",
  may: "05",
  june: "06",
  july: "07",
  august: "08",
  september: "09",
  october: "10",
  november: "11",
  december: "12",
  jan: "01",
  feb: "02",
  mar: "03",
  apr: "04",
  jun: "06",
  jul: "07",
  aug: "08",
  sep: "09",
  oct: "10",
  nov: "11",
  dec: "12",
};

const KNOWN_TECH = [
  "typescript",
  "javascript",
  "python",
  "next.js",
  "nextjs",
  "react",
  "node",
  "postgres",
  "drizzle",
  "tailwind",
  "flutter",
  "swift",
  "kotlin",
  "rust",
  "go",
  "solidity",
];

function pad2(n: number | string): string {
  return String(n).padStart(2, "0");
}

function firstUrl(text: string): string | null {
  const match = text.match(URL_RE);
  if (!match) return null;
  // Strip trailing punctuation the regex may have caught.
  return match[0].replace(/[.,;!?]+$/, "");
}

function extractDates(text: string): {
  startDate: string | null;
  endDate: string | null;
} {
  const iso = text.match(ISO_DATE_RE);
  if (iso) {
    return { startDate: iso[0], endDate: null };
  }
  const longMatch = text.match(LONG_DATE_RE) ?? text.match(SHORT_DATE_RE);
  if (!longMatch) return { startDate: null, endDate: null };
  const month = MONTHS[longMatch[1].toLowerCase()];
  const year = longMatch[4];
  if (!month) return { startDate: null, endDate: null };
  const startDate = `${year}-${month}-${pad2(longMatch[2])}`;
  const endDate = longMatch[3]
    ? `${year}-${month}-${pad2(longMatch[3])}`
    : null;
  return { startDate, endDate };
}

function extractName(text: string): string {
  const firstLine = text
    .split("\n")
    .map((l) => l.trim())
    .find((l) => l.length > 0);
  if (!firstLine) return "Untitled hackathon";
  // Prefer a short headline; trim long pastes to a name-sized string.
  return firstLine.replace(/^#+\s*/, "").slice(0, 120);
}

function extractPrize(text: string): string | null {
  const match = text.match(
    /(?:prize(?:s| pool)?|winnings?|rewards?)\s*[:–-]?\s*([^\n]{3,120})/i
  );
  if (!match) return null;
  return match[1].trim().slice(0, 200);
}

function extractTechHints(text: string): string[] {
  const lower = text.toLowerCase();
  return KNOWN_TECH.filter((t) => lower.includes(t)).slice(0, 10);
}

export function parseHackathonDraft(input: {
  text?: string;
  url?: string;
}): ParsedDraft {
  const text = (input.text ?? "").trim();
  const explicitUrl = input.url?.trim() || null;
  const foundUrl = explicitUrl ?? (text ? firstUrl(text) : null);
  const { startDate, endDate } = text
    ? extractDates(text)
    : { startDate: null, endDate: null };
  const isRemote = /remote|online|virtual/i.test(text);
  const prize = text ? extractPrize(text) : null;
  const techHints = text ? extractTechHints(text) : [];
  const summary = text
    ? text.replace(/\s+/g, " ").trim().slice(0, 280) || null
    : null;

  return {
    draft: {
      name: text ? extractName(text) : explicitUrl ?? "Untitled hackathon",
      organizer: null,
      location: isRemote ? "Remote" : null,
      isRemote,
      startDate,
      endDate,
      applicationDeadline: null,
      url: foundUrl,
      status: "reviewing",
      result: "none",
      rank: null,
      prize,
      technologies: techHints,
      teamMembers: [],
      projectName: null,
      projectUrl: null,
      repoUrl: null,
      notes: summary,
      learnings: null,
    },
    extras: {
      prizeAmount: prize?.match(/[\d,]+/)?.[0]?.replace(/,/g, "") ?? null,
      techHints,
    },
  };
}
