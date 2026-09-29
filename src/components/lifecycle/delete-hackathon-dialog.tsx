"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface DeleteHackathonDialogProps {
  hackathonId: string;
  hackathonName: string;
  disabled: boolean;
  onDeleted: () => void;
}

interface GuardResponse {
  allowed?: boolean;
  message?: string;
}

/**
 * Delete hackathon dialog, pre-event only (PAY-11). Two-step inline
 * confirm. Deletion is blocked (via the `disabled` prop, computed with
 * `canDeleteHackathon`) once payment is confirmed or the event is over;
 * the confirm step re-checks the registration API guard best-effort.
 */
export function DeleteHackathonDialog({
  hackathonId,
  hackathonName,
  disabled,
  onDeleted,
}: DeleteHackathonDialogProps) {
  const [step, setStep] = useState<"idle" | "confirm">("idle");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/registration", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hackathonId }),
      });
      if (res.status === 409) {
        let message = "Deletion is blocked: payment confirmed or event over.";
        try {
          const data = (await res.json()) as GuardResponse;
          if (typeof data.message === "string" && data.message.length > 0) {
            message = data.message;
          }
        } catch {
          // keep default message
        }
        setError(message);
        setBusy(false);
        setStep("idle");
        return;
      }
    } catch {
      // Offline / MVP: the store is the source of truth, proceed.
    }
    setBusy(false);
    setStep("idle");
    onDeleted();
  }

  if (disabled) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Delete hackathon</CardTitle>
          <CardDescription>
            Deletion is blocked once payment is confirmed or the event is
            over.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" disabled className="w-full sm:w-auto">
            Delete &ldquo;{hackathonName}&rdquo;
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (step === "confirm") {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Delete this hackathon?</CardTitle>
          <CardDescription>
            This permanently removes &ldquo;{hackathonName}&rdquo;. This
            action cannot be undone.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {error ? (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          ) : null}
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              variant="destructive"
              onClick={handleConfirm}
              disabled={busy}
              className="w-full sm:w-auto"
            >
              {busy ? "Deleting…" : "Yes, delete it"}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setStep("idle");
                setError(null);
              }}
              disabled={busy}
              className="w-full sm:w-auto"
            >
              Keep it
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Delete hackathon</CardTitle>
        <CardDescription>
          Pre-event entries can be removed in two steps.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {error ? (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        ) : null}
        <Button
          variant="destructive"
          onClick={() => setStep("confirm")}
          className="w-full sm:w-auto"
        >
          Delete &ldquo;{hackathonName}&rdquo;
        </Button>
      </CardContent>
    </Card>
  );
}
