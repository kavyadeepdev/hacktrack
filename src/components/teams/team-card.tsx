import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Team } from "@/lib/teams/types";

interface TeamCardProps {
  team: Team;
  memberCount?: number;
}

export function TeamCard({ team, memberCount }: TeamCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base">
            <a href={`/teams/${team.id}`} className="underline-offset-4 hover:underline">
              {team.name}
            </a>
          </CardTitle>
          {typeof memberCount === "number" ? (
            <Badge variant="secondary">
              {memberCount} {memberCount === 1 ? "member" : "members"}
            </Badge>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {team.description ? (
          <p className="text-sm text-muted-foreground">{team.description}</p>
        ) : null}
        {team.hackathonId ? (
          <p className="text-xs text-muted-foreground">Hackathon: {team.hackathonId}</p>
        ) : null}
        <a
          href={`/teams/${team.id}`}
          className="inline-flex min-h-[44px] items-center text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          View team
        </a>
      </CardContent>
    </Card>
  );
}
