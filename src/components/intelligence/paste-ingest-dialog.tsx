"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface IngestResponse {
  draft?: Record<string, unknown>;
  extras?: Record<string, unknown>;
  error?: string;
}

async function copyToClipboard(value: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    return false;
  }
}

export function PasteIngestDialog() {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<IngestResponse | null>(null);
  const [copied, setCopied] = useState(false);

  async function onParse(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setLoading(true);
    setResult(null);
    setCopied(false);
    try {
      const res = await fetch("/api/ai/parse", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text: text.trim() }),
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

  if (!open) {
    return (
      <Button
        type="button"
        variant="outline"
        className="min-h-[44px] w-full sm:w-auto"
        onClick={() => setOpen(true)}
      >
        Paste event text to draft
      </Button>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Paste text to draft</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={onParse} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="paste-text">Event text</Label>
            <Textarea
              id="paste-text"
              placeholder="Paste the hackathon announcement, rules, dates…"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              type="submit"
              disabled={loading || !text.trim()}
              className="min-h-[44px] w-full sm:w-auto"
            >
              {loading ? "Parsing…" : "Parse to draft"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="min-h-[44px]"
              onClick={() => {
                setOpen(false);
                setResult(null);
                setText("");
              }}
            >
              Close
            </Button>
          </div>
        </form>

        {result?.error && (
          <p className="text-sm text-destructive">{result.error}</p>
        )}

        {draftJson && (
          <div className="space-y-3">
            <Label htmlFor="paste-draft">Draft JSON</Label>
            <pre
              id="paste-draft"
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
