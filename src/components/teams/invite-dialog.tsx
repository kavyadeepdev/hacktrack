"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { canInvite } from "@/lib/access/guards";
import type { TeamRole } from "@/lib/access/roles";

interface InviteDialogProps {
  teamId: string;
  inviteCode: string | null | undefined;
  actorRole: TeamRole | null | undefined;
  onRotated?: (code: string) => void;
}

export function InviteDialog({ teamId, inviteCode, actorRole, onRotated }: InviteDialogProps) {
  const [code, setCode] = useState(inviteCode ?? "");
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const allowed = canInvite(actorRole);

  async function copy() {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setStatus("Copied to clipboard.");
    } catch {
      setStatus("Copy failed — select the code manually.");
    }
  }

  async function rotate() {
    setBusy(true);
    setStatus(null);
    try {
      const res = await fetch(`/api/teams/${teamId}/invite`, { method: "POST" });
      if (!res.ok) throw new Error(`Server responded ${res.status}`);
      const data = (await res.json()) as { code: string };
      setCode(data.code);
      onRotated?.(data.code);
      setStatus("New invite code issued. The previous code no longer works.");
    } catch {
      setStatus("Could not rotate the invite code (server store unavailable).");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Invite code</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <Label htmlFor={`invite-code-${teamId}`}>Active code</Label>
          <Input
            id={`invite-code-${teamId}`}
            value={code}
            readOnly
            placeholder="No active invite code"
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Codes expire after 7 days. Share the code out-of-band; new members join
          with it and are recorded in the access audit.
        </p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button type="button" variant="outline" onClick={copy} disabled={!code}>
            Copy code
          </Button>
          {allowed ? (
            <Button type="button" onClick={rotate} disabled={busy}>
              {busy ? "Rotating…" : "Rotate code"}
            </Button>
          ) : null}
        </div>
        {status ? <p className="text-sm text-muted-foreground">{status}</p> : null}
      </CardContent>
    </Card>
  );
}
