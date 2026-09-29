"use client";

import { use } from "react";
import { ScheduleView } from "@/components/workspace/schedule-view";

/**
 * B16 — deadline deep link. Reuses the schedule experience with the
 * detail panel preselected on `deadlineId`.
 */
export default function ScheduleDetailPage({
  params,
}: {
  params: Promise<{ hackathonId: string; deadlineId: string }>;
}) {
  const { hackathonId, deadlineId } = use(params);
  return (
    <ScheduleView hackathonId={hackathonId} defaultView="list" focusId={deadlineId} />
  );
}
