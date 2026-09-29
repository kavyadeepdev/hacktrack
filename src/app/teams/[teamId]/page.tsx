"use client";
/* eslint-disable @next/next/no-html-link-for-pages -- Track A contract: cross-track back-links use plain <a> anchors */

import { use, useMemo, useState } from "react";
import { InviteDialog } from "@/components/teams/invite-dialog";
import { MemberList } from "@/components/teams/member-list";
import { PermissionGuard } from "@/components/access/role-guard";
import { RoleBadge } from "@/components/access/role-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { canManageMembers } from "@/lib/access/guards";
import { TEAM_ROLES, type TeamRole } from "@/lib/access/roles";
import { useTeams } from "@/lib/teams/actions";

const ROLE_OPTIONS = TEAM_ROLES.map((r) => ({
  value: r,
  label: r.charAt(0).toUpperCase() + r.slice(1),
}));

export default function TeamDetailPage({
  params,
}: {
  params: Promise<{ teamId: string }>;
}) {
  const { teamId } = use(params);
  const {
    hydrated,
    getTeam,
    updateTeam,
    addMember,
    updateMemberRole,
    removeMember,
  } = useTeams();

  // Demo actor switching: the MVP has no auth, so the viewer picks which
  // roster member they act as (defaults to the first owner).
  const team = hydrated ? getTeam(teamId) : null;
  const [actorId, setActorId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<TeamRole>("member");
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const actor = useMemo(() => {
    if (!team || team.members.length === 0) return null;
    return team.members.find((m) => m.id === actorId) ?? team.members[0];
  }, [team, actorId]);
  const actorRole: TeamRole | null = actor ? actor.role : null;

  if (!hydrated) {
    return (
      <main className="mx-auto w-full max-w-2xl space-y-4 p-4">
        <p className="text-sm text-muted-foreground">Loading team…</p>
      </main>
    );
  }

  if (!team) {
    return (
      <main className="mx-auto w-full max-w-2xl space-y-4 p-4 pb-24 sm:pb-8">
        <nav className="flex items-center gap-4 text-sm">
          <a href="/teams" className="underline-offset-4 hover:underline">
            Teams
          </a>
          <a href="/hackathons" className="underline-offset-4 hover:underline">
            Hackathons
          </a>
        </nav>
        <h1 className="text-xl font-semibold">Team not found</h1>
        <p className="text-sm text-muted-foreground">
          This team does not exist in this browser&apos;s local store.
        </p>
      </main>
    );
  }

  function handleAddMember() {
    if (!team || !name.trim()) return;
    addMember(team.id, {
      displayName: name.trim(),
      email: email.trim() ? email.trim() : null,
      role,
    });
    setName("");
    setEmail("");
    setRole("member");
  }

  function startEditing() {
    if (!team) return;
    setEditName(team.name);
    setEditDescription(team.description ?? "");
    setEditing(true);
  }

  function saveEditing() {
    if (!team || !editName.trim()) return;
    updateTeam(team.id, {
      name: editName.trim(),
      description: editDescription.trim() ? editDescription.trim() : null,
    });
    setEditing(false);
  }

  return (
    <main className="mx-auto w-full max-w-2xl space-y-4 p-4 pb-24 sm:pb-8">
      <nav className="flex items-center gap-4 text-sm">
        <a href="/teams" className="underline-offset-4 hover:underline">
          Teams
        </a>
        <a href="/hackathons" className="underline-offset-4 hover:underline">
          Hackathons
        </a>
        <a href="/timeline" className="underline-offset-4 hover:underline">
          Timeline
        </a>
      </nav>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{team.name}</CardTitle>
          {team.description ? (
            <p className="text-sm text-muted-foreground">{team.description}</p>
          ) : null}
          {team.hackathonId ? (
            <p className="text-xs text-muted-foreground">
              Hackathon: {team.hackathonId}
            </p>
          ) : null}
        </CardHeader>
        <CardContent className="space-y-3">
          <PermissionGuard role={actorRole} permission="team:edit">
            {editing ? (
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="edit-team-name">Team name</Label>
                  <Input
                    id="edit-team-name"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    maxLength={80}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-team-description">Description</Label>
                  <Input
                    id="edit-team-description"
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    maxLength={500}
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="button" onClick={saveEditing}>
                    Save
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setEditing(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <Button type="button" variant="outline" onClick={startEditing}>
                Edit team
              </Button>
            )}
          </PermissionGuard>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Acting as</CardTitle>
          <p className="text-xs text-muted-foreground">
            The MVP has no auth — pick a roster member to preview RBAC.
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Select
              aria-label="Acting as member"
              options={team.members.map((m) => ({
                value: m.id,
                label: `${m.displayName} (${m.role})`,
              }))}
              value={actor?.id ?? ""}
              onChange={(e) => setActorId(e.target.value)}
              disabled={team.members.length === 0}
            />
            {actor ? <RoleBadge role={actor.role} /> : null}
          </div>
        </CardContent>
      </Card>

      <InviteDialog
        teamId={team.id}
        inviteCode={team.inviteCode}
        actorRole={actorRole}
      />

      <section className="space-y-3">
        <h2 className="text-base font-semibold">
          Members ({team.members.length})
        </h2>
        <MemberList
          members={team.members}
          actorRole={actorRole}
          onChangeRole={(memberId, next) => updateMemberRole(team.id, memberId, next)}
          onRemove={(memberId) => removeMember(team.id, memberId)}
        />
      </section>

      {canManageMembers(actorRole) || team.members.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Add member</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="member-name">Name</Label>
              <Input
                id="member-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Grace Hopper"
                maxLength={80}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="member-email">Email (optional)</Label>
              <Input
                id="member-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                maxLength={160}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="member-role">Role</Label>
              <Select
                id="member-role"
                options={ROLE_OPTIONS}
                value={role}
                onChange={(e) => setRole(e.target.value as TeamRole)}
              />
            </div>
            <Button type="button" onClick={handleAddMember} disabled={!name.trim()}>
              Add member
            </Button>
          </CardContent>
        </Card>
      ) : null}
    </main>
  );
}
