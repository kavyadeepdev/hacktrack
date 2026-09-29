import { Badge } from "@/components/ui/badge";
import { ROLE_LABELS, type TeamRole } from "@/lib/access/roles";

const VARIANT: Record<TeamRole, "default" | "secondary" | "outline"> = {
  owner: "default",
  member: "secondary",
  viewer: "outline",
};

export function RoleBadge({ role }: { role: TeamRole }) {
  return <Badge variant={VARIANT[role]}>{ROLE_LABELS[role]}</Badge>;
}
