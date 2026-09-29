"use client";

import { use } from "react";
import Link from "next/link";
import { ReminderBanner } from "@/components/reminders/reminder-banner";
import { SubmissionChecklist } from "@/components/outcomes/submission-checklist";
import { useDeadlines } from "@/lib/deadlines/storage";
import { getDueSoon, getOverdue } from "@/lib/deadlines/reminders";
import { useMemo } from "react";

/**
 * B15 — workspace overview. Stats, reminder strip, section cards linking
 * to each tab, checklist + export summary.
 */
export default function WorkspaceOverviewPage({
  params,
}: {
  params: Promise<{ hackathonId: string }>;
}) {
  const { hackathonId } = use(params);
  const { deadlines, hydrated } = useDeadlines(hackathonId);
  const dueSoon = useMemo(() => getDueSoon(deadlines), [deadlines]);
  const overdue = useMemo(() => getOverdue(deadlines), [deadlines]);

  const sections = [
    {
      href: `/workspace/${hackathonId}/schedule`,
      title: "Schedule",
      desc: "Calendar, list and detail views for every deadline.",
    },
    {
      href: `/workspace/${hackathonId}/resources`,
      title: "Resources",
      desc: "Problem statements and the link library.",
    },
    {
      href: `/workspace/${hackathonId}/submissions`,
      title: "Submissions",
      desc: "Demo video, deck, repo and tech stack.",
    },
    {
      href: `/workspace/${hackathonId}/outcomes`,
      title: "Outcomes",
      desc: "Result, prize and retrospective notes.",
    },
    {
      href: `/workspace/${hackathonId}/ideate`,
      title: "Ideate",
      desc: "Brainstorm ideas, check off what ships.",
    },
  ];

  return (
    <div className="space-y-4">
      <ReminderBanner deadlines={deadlines} />

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Deadlines", count: deadlines.length },
          { label: "Due soon", count: dueSoon.length },
          { label: "Overdue", count: overdue.length },
        ].map((s) => (
          <div key={s.label} className="rounded-lg border bg-card p-3 text-center">
            <p className="text-xl font-bold">{hydrated ? s.count : "–"}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <ul className="space-y-2">
        {sections.map((s) => (
          <li key={s.href}>
            <Link
              href={s.href}
              className="block min-h-[44px] rounded-lg border bg-card p-3 shadow-sm hover:bg-muted/60"
            >
              <span className="text-sm font-semibold text-[#006BFF]">
                {s.title}
              </span>
              <span className="mt-0.5 block text-sm text-muted-foreground">
                {s.desc}
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <SubmissionChecklist
        submission={{}}
        deadlines={deadlines}
        hackathonId={hackathonId}
      />
    </div>
  );
}
