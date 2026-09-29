"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";

interface PaymentGateProps {
  hackathonId: string;
  paid: boolean;
  onToggle: (paid: boolean) => void;
}

/**
 * Payment-checkbox gate (PAY-10). Unchecked renders a minimal
 * pre-hackathon view; checked reveals the full registration fieldset
 * plus a deep link to `/workspace/[hackathonId]`. Track B fields live
 * only behind that link, never inlined here.
 */
export function PaymentGate({ hackathonId, paid, onToggle }: PaymentGateProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="text-base">Registration payment</CardTitle>
          <Badge variant={paid ? "default" : "secondary"}>
            {paid ? "Paid" : "Pre-hackathon"}
          </Badge>
        </div>
        <CardDescription>
          {paid
            ? "Payment confirmed — the full registration fieldset is unlocked."
            : "Confirm payment to unlock the full registration details."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <input
            id={`payment-confirmed-${hackathonId}`}
            type="checkbox"
            checked={paid}
            onChange={(event) => onToggle(event.target.checked)}
            className="h-6 w-6 min-h-[44px] min-w-[44px] shrink-0 accent-current"
            aria-describedby={`payment-hint-${hackathonId}`}
          />
          <Label
            htmlFor={`payment-confirmed-${hackathonId}`}
            className="min-h-[44px] flex-1 content-center text-sm"
          >
            Payment confirmed for this hackathon
          </Label>
        </div>
        <p
          id={`payment-hint-${hackathonId}`}
          className="text-sm text-muted-foreground"
        >
          {paid
            ? "Uncheck to collapse back to the minimal pre-hackathon view."
            : "Minimal pre-hackathon view. Check the box once payment is done."}
        </p>

        {paid ? (
          <div className="space-y-3 rounded-md border p-4">
            <p className="text-sm font-medium">Registration fieldset</p>
            <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
              <li>Payment status: confirmed</li>
              <li>Registration checklist unlocked</li>
              <li>Workspace access enabled</li>
            </ul>
            <Button asChild className="w-full sm:w-auto">
              <a href={`/workspace/${hackathonId}`}>Open workspace</a>
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
