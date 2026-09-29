import { Badge } from "@/components/ui/badge";
import { STATUS_LABELS } from "@/lib/constants";
import type { HackathonStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const STYLES: Record<HackathonStatus, string> = {
  reviewing: "bg-sky-100 text-sky-900 border-sky-200",
  planning_to_apply: "bg-violet-100 text-violet-900 border-violet-200",
  applied: "bg-amber-100 text-amber-900 border-amber-200",
  accepted: "bg-emerald-100 text-emerald-900 border-emerald-200",
  attended: "bg-zinc-900 text-zinc-50 border-zinc-900",
  declined: "bg-rose-100 text-rose-900 border-rose-200",
  skipped: "bg-zinc-100 text-zinc-600 border-zinc-200",
};

export function StatusBadge({ status }: { status: HackathonStatus }) {
  return (
    <Badge variant="outline" className={cn("border", STYLES[status])}>
      {STATUS_LABELS[status]}
    </Badge>
  );
}
