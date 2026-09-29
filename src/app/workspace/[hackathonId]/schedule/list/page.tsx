"use client";

import { use } from "react";
import { ScheduleView } from "@/components/workspace/schedule-view";

/** B16 — list-first entry point; same view, list preselected. */
export default function ScheduleListPage({
  params,
}: {
  params: Promise<{ hackathonId: string }>;
}) {
  const { hackathonId } = use(params);
  return <ScheduleView hackathonId={hackathonId} defaultView="list" />;
}
