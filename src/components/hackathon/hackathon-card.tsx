import Link from "next/link";
import { CalendarDays, MapPin, Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "./status-badge";
import { RESULT_LABELS } from "@/lib/constants";
import type { Hackathon } from "@/lib/types";

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
  const when = [fmt(hackathon.startDate), fmt(hackathon.endDate)]
    .filter(Boolean)
    .join(" → ");
  return (
    <Link
      href={`/hackathons/${hackathon.id}`}
      className="block active:scale-[0.99] transition-transform"
    >
      <Card className="hover:shadow-md">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-base leading-snug">
              {hackathon.name}
            </CardTitle>
            <StatusBadge status={hackathon.status} />
          </div>
          {hackathon.organizer && (
            <p className="text-sm text-muted-foreground">
              {hackathon.organizer}
            </p>
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
        </CardContent>
      </Card>
    </Link>
  );
}
