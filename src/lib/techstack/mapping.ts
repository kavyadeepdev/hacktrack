/**
 * Tech-stack mapping (B9, PAY-23).
 * Pure helpers shared by the detect API route and badge UI.
 * No client/server dependencies — safe to import anywhere in Track B.
 */

export interface TechEntry {
  name: string;
  bytes: number;
  percent: number;
}

export interface ParsedRepo {
  owner: string;
  repo: string;
}

const NAME_PATTERN = /^[A-Za-z0-9_.-]+$/;

/**
 * Parse + validate a GitHub repo URL.
 * Mirrors `github-link-input.tsx` so the B8 -> B9 contract stays in sync:
 * B8 saves the canonical repo URL, B9 parses it back to owner/repo.
 */
export function parseRepoUrl(value: string): ParsedRepo | null {
  let u: URL;
  try {
    u = new URL(value.trim());
  } catch {
    return null;
  }
  if (u.protocol !== "http:" && u.protocol !== "https:") return null;
  if (u.hostname.replace(/^www\./, "").toLowerCase() !== "github.com") return null;
  const segments = u.pathname.split("/").filter(Boolean);
  if (segments.length < 2) return null;
  const owner = segments[0];
  const repo = segments[1].replace(/\.git$/i, "");
  if (!owner || !repo) return null;
  if (!NAME_PATTERN.test(owner) || !NAME_PATTERN.test(repo)) return null;
  if (owner === "." || owner === ".." || repo === "." || repo === "..") return null;
  return { owner, repo };
}

export function toCanonicalRepoUrl(parsed: ParsedRepo): string {
  return `https://github.com/${parsed.owner}/${parsed.repo}`;
}

/**
 * Map GitHub's language byte-breakdown (`GET /repos/:owner/:repo/languages`)
 * to a sorted tech-stack list with percentage share (1 decimal).
 */
export function mapLanguagesToStack(
  languages: Record<string, number> | null | undefined
): TechEntry[] {
  if (!languages || typeof languages !== "object") return [];
  const entries = Object.entries(languages).filter(
    (entry): entry is [string, number] =>
      typeof entry[0] === "string" &&
      typeof entry[1] === "number" &&
      Number.isFinite(entry[1]) &&
      entry[1] > 0
  );
  const total = entries.reduce((sum, [, bytes]) => sum + bytes, 0);
  if (total <= 0) return [];
  return entries
    .map(([name, bytes]) => ({
      name,
      bytes,
      percent: Math.round((bytes / total) * 1000) / 10,
    }))
    .sort((a, b) => b.bytes - a.bytes);
}
