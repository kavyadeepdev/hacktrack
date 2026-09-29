import type { TimelineEntryData } from "@/lib/timeline/queries";
import { TimelineEntryCard } from "@/components/timeline/timeline-entry";

interface TimelineChartProps {
  entries: TimelineEntryData[];
}

/**
 * Chronological accumulation chart (PAY-12): oldest attended hackathon
 * first, rendered as a vertical timeline.
 */
export function TimelineChart({ entries }: TimelineChartProps) {
  if (entries.length === 0) {
    return (
      <div className="rounded-lg border p-6 text-center">
        <p className="font-medium">No attended hackathons yet</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Hackathons you attend will accumulate here in chronological order.
        </p>
      </div>
    );
  }

  return (
    <ol className="relative space-y-4 border-l pl-4">
      {entries.map((entry) => (
        <li key={entry.id} className="relative">
          <span
            aria-hidden="true"
            className="absolute -left-[21px] top-4 h-2.5 w-2.5 rounded-full bg-primary"
          />
          <TimelineEntryCard entry={entry} />
        </li>
      ))}
    </ol>
  );
}
