"use client";

import { use } from "react";
import { ScheduleView } from "@/components/workspace/schedule-view";

/** B15 — schedule overview (defaults to list; switcher offers calendar). */
export default function SchedulePage({
  params,
}: {
  params: Promise<{ hackathonId: string }>;
}) {
  const { hackathonId } = use(params);
  return <ScheduleView hackathonId={hackathonId} defaultView="list" />;
}
