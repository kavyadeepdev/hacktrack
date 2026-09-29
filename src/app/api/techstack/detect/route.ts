/**
 * Tech-stack detect API (B9, PAY-23).
 * Fetches a public repo's language breakdown via GitHub REST (no token)
 * and maps it to a tech-stack list.
 *
 * B8 -> B9 contract: `repoUrl` is the canonical URL saved by
 * `github-link-input.tsx` to the `submissions` row.
 *
 *   GET  /api/techstack/detect?repoUrl=https://github.com/owner/repo
 *   POST /api/techstack/detect { repoUrl }
 */

import { mapLanguagesToStack, parseRepoUrl } from "@/lib/techstack/mapping";

interface DetectBody {
  repoUrl?: unknown;
  url?: unknown;
}

function extractRepoUrl(value: unknown): string | null {
  if (typeof value === "string") return value;
  if (typeof value !== "object" || value === null) return null;
  const body = value as DetectBody;
  if (typeof body.repoUrl === "string") return body.repoUrl;
  if (typeof body.url === "string") return body.url;
  return null;
}

async function detect(repoUrl: string) {
  const parsed = parseRepoUrl(repoUrl);
  if (!parsed) {
    return Response.json(
      { message: "repoUrl must look like https://github.com/owner/repo." },
      { status: 400 }
    );
  }
  const { owner, repo } = parsed;
  let upstream: Response;
  try {
    upstream = await fetch(`https://api.github.com/repos/${owner}/${repo}/languages`, {
      headers: {
        Accept: "application/vnd.github+json",
        "User-Agent": "HackTrack",
      },
    });
  } catch {
    return Response.json(
      { message: "Could not reach GitHub. Try again." },
      { status: 502 }
    );
  }

  if (upstream.status === 404) {
    return Response.json(
      { owner, repo, message: "Repo not found or private." },
      { status: 404 }
    );
  }
  if (upstream.status === 403) {
    return Response.json(
      { owner, repo, message: "GitHub rate limit hit. Try again shortly." },
      { status: 403 }
    );
  }
  if (!upstream.ok) {
    return Response.json(
      { owner, repo, message: "GitHub lookup failed. Try again." },
      { status: 502 }
    );
  }

  let languages: Record<string, number> = {};
  try {
    languages = (await upstream.json()) as Record<string, number>;
  } catch {
    return Response.json(
      { owner, repo, message: "GitHub returned an unreadable response." },
      { status: 502 }
    );
  }

  const stack = mapLanguagesToStack(languages);
  return Response.json({
    owner,
    repo,
    repoUrl: `https://github.com/${owner}/${repo}`,
    languages,
    stack,
  });
}

export async function GET(request: Request) {
  const repoUrl = new URL(request.url).searchParams.get("repoUrl");
  if (!repoUrl) {
    return Response.json(
      { message: "Pass ?repoUrl=https://github.com/owner/repo." },
      { status: 400 }
    );
  }
  return detect(repoUrl);
}

export async function POST(request: Request) {
  let json: unknown = null;
  try {
    json = await request.json();
  } catch {
    return Response.json({ message: "Invalid JSON body." }, { status: 400 });
  }
  const repoUrl = extractRepoUrl(json);
  if (!repoUrl) {
    return Response.json(
      { message: "Body must be { repoUrl: string }." },
      { status: 400 }
    );
  }
  return detect(repoUrl);
}
