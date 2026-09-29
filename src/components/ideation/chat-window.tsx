"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useIdeas } from "./use-ideas";
import { IdeaLine } from "./idea-line";
import { IdeaGroup } from "./idea-group";

interface ChatWindowProps {
  hackathonId: string;
}

/**
 * Suggest follow-up feature angles for a seed idea (local heuristic —
 * the LLM draft endpoint lands separately in B12, so this stays offline).
 */
function suggestFeatures(seed: string): string[] {
  const s = seed.trim().replace(/\.$/, "");
  if (!s) return [];
  return [
    `${s} — offline-first mobile view`,
    `${s} — shareable public link + embed`,
    `${s} — reminder + calendar export hook`,
  ];
}

/**
 * B3 — ideation chat: free-text rows plus one-tap feature suggestions,
 * each row carrying an `IdeaCheckbox`; Implemented / Dropped groups
 * below via `IdeaGroup`.
 */
export function ChatWindow({ hackathonId }: ChatWindowProps) {
  const { ideas, hydrated, add, setStatus, remove } = useIdeas(hackathonId);
  const [draft, setDraft] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const active = ideas.filter((i) => i.status === "draft");
  const implemented = ideas.filter((i) => i.status === "implemented");
  const dropped = ideas.filter((i) => i.status === "dropped");

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!draft.trim()) return;
    const row = add(draft);
    setSuggestions(suggestFeatures(row.text));
    setDraft("");
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Ideation chat</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-2">
          <Label htmlFor="idea-input">New idea</Label>
          <div className="flex gap-2">
            <Input
              id="idea-input"
              placeholder="e.g. AI judging-criteria matcher…"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              maxLength={280}
              className="flex-1"
            />
            <Button
              type="submit"
              disabled={!draft.trim()}
              className="min-h-[44px] shrink-0"
            >
              Add
            </Button>
          </div>
        </form>

        {suggestions.length > 0 && (
          <div className="space-y-2 rounded-lg border p-3">
            <p className="text-sm font-semibold">Feature suggestions</p>
            <ul className="space-y-2">
              {suggestions.map((s) => (
                <li key={s} className="flex items-center gap-2">
                  <p className="min-w-0 flex-1 text-sm text-muted-foreground">
                    {s}
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="min-h-[44px] shrink-0"
                    onClick={() => {
                      add(s);
                      setSuggestions((prev) => prev.filter((x) => x !== s));
                    }}
                  >
                    Add
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {!hydrated ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : ideas.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No ideas yet. Add the first spark above — checkbox it when built,
            drop it when cut.
          </p>
        ) : (
          <div className="space-y-4">
            {active.length > 0 && (
              <ul className="space-y-2" aria-label="Active ideas">
                {active.map((idea) => (
                  <IdeaLine
                    key={idea.id}
                    idea={idea}
                    onToggleImplemented={(id, checked) =>
                      setStatus(id, checked ? "implemented" : "draft")
                    }
                    onDrop={(id) => setStatus(id, "dropped")}
                    onRestore={(id) => setStatus(id, "draft")}
                    onDelete={remove}
                  />
                ))}
              </ul>
            )}
            <IdeaGroup
              title="Implemented"
              count={implemented.length}
              emptyHint="Nothing implemented yet — check an idea when you build it."
            >
              {implemented.map((idea) => (
                <IdeaLine
                  key={idea.id}
                  idea={idea}
                  onToggleImplemented={(id, checked) =>
                    setStatus(id, checked ? "implemented" : "draft")
                  }
                  onDrop={(id) => setStatus(id, "dropped")}
                  onRestore={(id) => setStatus(id, "draft")}
                  onDelete={remove}
                />
              ))}
            </IdeaGroup>
            <IdeaGroup
              title="Dropped"
              count={dropped.length}
              emptyHint="Nothing dropped — cut ideas land here, restorable."
            >
              {dropped.map((idea) => (
                <IdeaLine
                  key={idea.id}
                  idea={idea}
                  onToggleImplemented={(id, checked) =>
                    setStatus(id, checked ? "implemented" : "draft")
                  }
                  onDrop={(id) => setStatus(id, "dropped")}
                  onRestore={(id) => setStatus(id, "draft")}
                  onDelete={remove}
                />
              ))}
            </IdeaGroup>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
