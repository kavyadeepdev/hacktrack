import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  formatEntryDates,
  type TimelineEntryData,
} from "@/lib/timeline/queries";

interface TimelineEntryCardProps {
  entry: TimelineEntryData;
}

/**
 * Single timeline entry (PAY-12). Links out via plain anchors to the
 * tracker detail page and the workspace.
 */
export function TimelineEntryCard({ entry }: TimelineEntryCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="text-base">
            <a
              href={`/hackathons/${entry.id}`}
              className="min-h-[44px] underline-offset-4 hover:underline"
            >
              {entry.name}
            </a>
          </CardTitle>
          <Badge variant="secondary">{entry.result.replaceAll("_", " ")}</Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          {formatEntryDates(entry)}
          {entry.location ? ` · ${entry.location}` : ""}
          {entry.organizer ? ` · ${entry.organizer}` : ""}
        </p>
      </CardHeader>
      <CardContent className="space-y-2">
        {entry.projectName ? (
          <p className="text-sm">
            <span className="font-medium">Project:</span> {entry.projectName}
          </p>
        ) : null}
        {entry.rank ? (
          <p className="text-sm">
            <span className="font-medium">Rank:</span> {entry.rank}
          </p>
        ) : null}
        {entry.prize ? (
          <p className="text-sm">
            <span className="font-medium">Prize:</span> {entry.prize}
          </p>
        ) : null}
        {entry.learnings ? (
          <p className="text-sm text-muted-foreground">{entry.learnings}</p>
        ) : null}
        <a
          href={`/workspace/${entry.id}`}
          className="inline-flex min-h-[44px] items-center text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          Open workspace
        </a>
      </CardContent>
    </Card>
  );
}
