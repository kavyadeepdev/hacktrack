import { NextResponse } from "next/server";
import { buildParsePrompt, buildUrlPrompt } from "@/lib/ai/prompts";
import { parseHackathonDraft } from "@/lib/ai/parse";

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<\/(p|div|h1|h2|h3|h4|li|br)>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, 8000);
}

async function fetchPageText(url: string): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "user-agent": "HackTrack/1.0 ingest" },
    });
    if (!res.ok) {
      throw new Error(`Fetch failed with status ${res.status}`);
    }
    const contentType = res.headers.get("content-type") ?? "";
    const raw = await res.text();
    if (contentType.includes("application/json")) {
      return raw.slice(0, 8000);
    }
    return stripHtml(raw);
  } finally {
    clearTimeout(timeout);
  }
}

export async function POST(req: Request) {
  let body: { text?: unknown; url?: unknown };
  try {
    body = (await req.json()) as { text?: unknown; url?: unknown };
  } catch {
    return NextResponse.json(
      { error: "Request body must be JSON." },
      { status: 400 }
    );
  }

  const text = typeof body.text === "string" ? body.text.trim() : "";
  const url = typeof body.url === "string" ? body.url.trim() : "";

  if (!text && !url) {
    return NextResponse.json(
      { error: "Provide pasted text or a URL." },
      { status: 400 }
    );
  }

  if (url) {
    try {
      const u = new URL(url);
      if (u.protocol !== "http:" && u.protocol !== "https:") {
        throw new Error("bad protocol");
      }
    } catch {
      return NextResponse.json(
        { error: "URL must be a valid http(s) URL." },
        { status: 400 }
      );
    }
  }

  try {
    if (url) {
      const pageText = await fetchPageText(url);
      const parsed = parseHackathonDraft({ text: pageText, url });
      return NextResponse.json({
        ...parsed,
        prompt: buildUrlPrompt(url, pageText),
        source: "url",
      });
    }
    const parsed = parseHackathonDraft({ text });
    return NextResponse.json({
      ...parsed,
      prompt: buildParsePrompt(text),
      source: "text",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Parse failed.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
