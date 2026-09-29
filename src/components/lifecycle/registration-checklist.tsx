import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Hackathon } from "@/lib/types";

interface RegistrationChecklistProps {
  hackathon: Hackathon;
}

interface ChecklistItem {
  key: string;
  label: string;
  done: boolean;
}

/**
 * Registration checklist (PAY-11 companion). Read-only summary of the
 * registration steps for a hackathon: payment, key links, and dates.
 */
export function RegistrationChecklist({ hackathon }: RegistrationChecklistProps) {
  const items: ChecklistItem[] = [
    {
      key: "payment",
      label: "Payment confirmed",
      done: hackathon.paymentConfirmed === true,
    },
    {
      key: "event-url",
      label: "Event URL added",
      done: Boolean(hackathon.url),
    },
    {
      key: "dates",
      label: "Event dates set",
      done: Boolean(hackathon.startDate && hackathon.endDate),
    },
    {
      key: "status",
      label: "Application tracked",
      done: hackathon.status !== "reviewing",
    },
  ];
  const doneCount = items.filter((item) => item.done).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="text-base">Registration checklist</CardTitle>
          <Badge variant={doneCount === items.length ? "default" : "secondary"}>
            {doneCount} of {items.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item.key} className="flex items-center gap-3 text-sm">
              <span
                aria-hidden="true"
                className={
                  item.done
                    ? "flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground"
                    : "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs text-muted-foreground"
                }
              >
                {item.done ? "✓" : "·"}
              </span>
              <span className="min-h-[44px] flex-1 content-center">
                {item.label}
              </span>
              <Badge variant={item.done ? "default" : "outline"}>
                {item.done ? "Done" : "Todo"}
              </Badge>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
