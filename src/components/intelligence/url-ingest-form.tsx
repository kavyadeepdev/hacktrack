"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface IngestResponse {
  draft?: Record<string, unknown>;
  extras?: Record<string, unknown>;
  error?: string;
}

function isValidHttpUrl(value: string): boolean {
  try {
    const u = new URL(value.trim());
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

async function copyToClipboard(value: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    return false;
  }
}

export function UrlIngestForm() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<IngestResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function onParse(e: React.FormEvent) {
    e.preventDefault();
    if (!isValidHttpUrl(url)) {
      setError("URL must be a valid http(s) URL.");
      return;
    }
    setError(null);
    setLoading(true);
    setResult(null);
    setCopied(false);
    try {
      const res = await fetch("/api/ai/parse", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
      const json = (await res.json()) as IngestResponse;
      setResult(json);
    } catch {
      setResult({ error: "Could not reach the parse endpoint." });
    } finally {
      setLoading(false);
    }
  }

  const draftJson = result?.draft ? JSON.stringify(result.draft, null, 2) : "";
  const formLink = draftJson
    ? `/hackathons/new?draft=${encodeURIComponent(draftJson)}`
    : "/hackathons/new";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Import from URL</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={onParse} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="ingest-url">Event URL</Label>
            <Input
              id="ingest-url"
              inputMode="url"
              placeholder="https://…"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button
            type="submit"
            disabled={loading || !url.trim()}
            className="min-h-[44px] w-full sm:w-auto"
          >
            {loading ? "Fetching…" : "Fetch + parse"}
          </Button>
        </form>

        {result?.error && (
          <p className="text-sm text-destructive">{result.error}</p>
        )}

        {draftJson && (
          <div className="space-y-3">
            <Label htmlFor="url-draft">Draft JSON</Label>
            <pre
              id="url-draft"
              className="max-h-64 overflow-auto rounded-md border bg-muted p-3 text-xs"
            >
              {draftJson}
            </pre>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                type="button"
                variant="outline"
                className="min-h-[44px]"
                onClick={async () => {
                  setCopied(await copyToClipboard(draftJson));
                }}
              >
                {copied ? "Copied" : "Copy draft JSON"}
              </Button>
              <a
                href={formLink}
                className="inline-flex min-h-[44px] items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
              >
                Copy into form
              </a>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
