"use client";

import { use } from "react";
import { ScheduleView } from "@/components/workspace/schedule-view";

/** B16 — calendar-first entry point; same view, calendar preselected. */
export default function ScheduleCalendarPage({
  params,
}: {
  params: Promise<{ hackathonId: string }>;
}) {
  const { hackathonId } = use(params);
  return <ScheduleView hackathonId={hackathonId} defaultView="calendar" />;
}
