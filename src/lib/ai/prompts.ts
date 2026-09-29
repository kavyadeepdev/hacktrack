/**
 * Prompt builders for the AI ingest endpoint (`POST /api/ai/parse`).
 * Pure functions — safe to import from client components and the API route.
 *
 * Today the route runs a deterministic heuristic parser
 * (`src/lib/ai/parse.ts`); these prompts define the draft contract so a
 * hosted LLM can replace the heuristic later without changing callers.
 */

export const INGEST_SYSTEM_PROMPT = [
  "You extract hackathon details from pasted text or a fetched event page.",
  "Return ONLY a JSON object with this shape:",
  "{",
  '  "name": string (required, event name),',
  '  "organizer": string | null,',
  '  "location": string | null,',
  '  "isRemote": boolean,',
  '  "startDate": string | null (YYYY-MM-DD),',
  '  "endDate": string | null (YYYY-MM-DD),',
  '  "applicationDeadline": string | null (YYYY-MM-DD),',
  '  "url": string | null,',
  '  "notes": string | null (one short summary),',
  '  "technologies": string[] (hints only),',
  '  "prize": string | null,',
  "}",
  "Use null (never empty strings) for unknown optional fields.",
  "Never invent dates, prizes, or organizers — leave them null when unsure.",
].join("\n");

export function buildParsePrompt(text: string): string {
  const trimmed = text.trim().slice(0, 8000);
  return [
    INGEST_SYSTEM_PROMPT,
    "",
    "Source text:",
    "```",
    trimmed,
    "```",
  ].join("\n");
}

export function buildUrlPrompt(url: string, pageText: string): string {
  const trimmed = pageText.trim().slice(0, 8000);
  return [
    INGEST_SYSTEM_PROMPT,
    "",
    `Source URL: ${url}`,
    "",
    "Fetched page text:",
    "```",
    trimmed,
    "```",
  ].join("\n");
}
