"use client";

import { use, useEffect, useState } from "react";
import { VideoLinkInput } from "@/components/submissions/video-link-input";
import { PptLinkInput } from "@/components/submissions/ppt-link-input";
import { GithubLinkInput } from "@/components/submissions/github-link-input";
import { TechStackBadges } from "@/components/submissions/tech-stack-badges";
import { SubmissionChecklist } from "@/components/outcomes/submission-checklist";
import { useDeadlines } from "@/lib/deadlines/storage";

const SUBMISSIONS_KEY = "hacktrack:submissions:v1";

function readSubmissionField(
  hackathonId: string,
  field: "videoUrl" | "pptUrl" | "repoUrl"
): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SUBMISSIONS_KEY);
    if (!raw) return null;
    const map = JSON.parse(raw) as Record<string, Record<string, unknown>>;
    const value = map[hackathonId]?.[field];
    return typeof value === "string" ? value : null;
  } catch {
    return null;
  }
}

function readOutcomeResult(hackathonId: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(
      `hacktrack:workspace:${hackathonId}:outcome:v1`
    );
    if (!raw) return null;
    const row = JSON.parse(raw) as { result?: unknown };
    return typeof row.result === "string" ? row.result : null;
  } catch {
    return null;
  }
}

/**
 * B17 — submissions page in the design language. Link editor cards
 * (video / deck / repo), auto tech-stack detection from the saved repo,
 * checklist summary with calendar export.
 */
export default function SubmissionsPage({
  params,
}: {
  params: Promise<{ hackathonId: string }>;
}) {
  const { hackathonId } = use(params);
  const { deadlines } = useDeadlines(hackathonId);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [pptUrl, setPptUrl] = useState<string | null>(null);
  const [repoUrl, setRepoUrl] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);

  useEffect(() => {
    // Post-mount sync from localStorage (external system): stored rows can
    // only be read client-side after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVideoUrl(readSubmissionField(hackathonId, "videoUrl"));
    setPptUrl(readSubmissionField(hackathonId, "pptUrl"));
    setRepoUrl(readSubmissionField(hackathonId, "repoUrl"));
    setResult(readOutcomeResult(hackathonId));
  }, [hackathonId]);

  // Keep the checklist in sync when the Outcomes tab saves the result row
  // (same-tab writes don't fire `storage`, so re-read on focus too).
  useEffect(() => {
    function refresh() {
      setResult(readOutcomeResult(hackathonId));
    }
    function onStorage(e: StorageEvent) {
      if (e.key === `hacktrack:workspace:${hackathonId}:outcome:v1`) {
        refresh();
      }
    }
    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", refresh);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", refresh);
    };
  }, [hackathonId]);

  return (
    <div className="space-y-4">
      <div className="rounded-lg border bg-card p-3">
        <p className="text-sm text-muted-foreground">
          Save each artifact link. The repo feed powers tech-stack detection
          below.
        </p>
      </div>

      <VideoLinkInput hackathonId={hackathonId} onSave={setVideoUrl} />
      <PptLinkInput hackathonId={hackathonId} onSave={setPptUrl} />
      <GithubLinkInput hackathonId={hackathonId} onSave={(url) => setRepoUrl(url)} />
      <TechStackBadges repoUrl={repoUrl} />

      <SubmissionChecklist
        submission={{ videoUrl, pptUrl, repoUrl, result }}
        deadlines={deadlines}
        hackathonId={hackathonId}
      />
    </div>
  );
}
