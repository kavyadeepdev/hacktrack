import Link from "next/link";
import { CalendarDays, ExternalLink, MapPin, Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "./status-badge";
import { RESULT_LABELS } from "@/lib/constants";
import type { Hackathon } from "@/lib/types";

type HackathonWithLinks = Hackathon & { registrationUrl?: string | null };

function fmt(date?: string | null) {
  if (!date) return null;
  const d = new Date(date.length <= 10 ? `${date}T12:00:00` : date);
  if (Number.isNaN(d.getTime())) return date;
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function HackathonCard({ hackathon }: { hackathon: Hackathon }) {
  const withLinks = hackathon as HackathonWithLinks;
  const when = [fmt(hackathon.startDate), fmt(hackathon.endDate)]
    .filter(Boolean)
    .join(" → ");
  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <Link
            href={`/hackathons/${hackathon.id}`}
            className="inline-flex min-h-[44px] items-center rounded underline-offset-4 hover:underline"
          >
            <CardTitle className="text-base leading-snug">
              {hackathon.name}
            </CardTitle>
          </Link>
          <StatusBadge status={hackathon.status} />
        </div>
        {hackathon.organizer && (
          <p className="text-sm text-muted-foreground">{hackathon.organizer}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-1.5 text-sm text-muted-foreground">
        {when && (
          <p className="flex items-center gap-1.5">
            <CalendarDays className="size-4 shrink-0" /> {when}
          </p>
        )}
        {(hackathon.location || hackathon.isRemote) && (
          <p className="flex items-center gap-1.5">
            <MapPin className="size-4 shrink-0" />
            {hackathon.isRemote ? "Remote" : hackathon.location}
          </p>
        )}
        {hackathon.result !== "none" && (
          <p className="flex items-center gap-1.5 text-foreground">
            <Trophy className="size-4 shrink-0" />
            {RESULT_LABELS[hackathon.result]}
            {hackathon.rank ? ` · ${hackathon.rank}` : ""}
          </p>
        )}
        {(hackathon.url || withLinks.registrationUrl) && (
          <div className="flex flex-wrap gap-2 pt-1">
            {hackathon.url && (
              <a
                href={hackathon.url}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex min-h-[44px] items-center gap-1 rounded-md border px-3 text-sm font-medium text-foreground"
              >
                <ExternalLink className="size-4" /> Event site
              </a>
            )}
            {withLinks.registrationUrl && (
              <a
                href={withLinks.registrationUrl}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex min-h-[44px] items-center gap-1 rounded-md border px-3 text-sm font-medium text-foreground"
              >
                <ExternalLink className="size-4" /> Register
              </a>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
