import { Card, CardContent } from "@/components/ui/card";
import type { Hackathon } from "@/lib/types";

export function StatsStrip({ hackathons }: { hackathons: Hackathon[] }) {
  const total = hackathons.length;
  const applied = hackathons.filter((h) =>
    ["applied", "accepted", "attended"].includes(h.status)
  ).length;
  const attended = hackathons.filter((h) => h.status === "attended").length;
  const wins = hackathons.filter((h) =>
    ["won", "finalist"].includes(h.result)
  ).length;

  const stats = [
    { label: "Tracked", value: total },
    { label: "Applied+", value: applied },
    { label: "Attended", value: attended },
    { label: "Wins / Finals", value: wins },
  ];

  return (
    <div className="grid grid-cols-4 gap-2">
      {stats.map((s) => (
        <Card key={s.label} className="text-center">
          <CardContent className="p-3">
            <div className="text-xl font-bold tabular-nums">{s.value}</div>
            <div className="text-[11px] leading-tight text-muted-foreground">
              {s.label}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
