# Teams + Access (Track A)

Roles, invite flow, and audit for team formation (PAY-8 / PAY-9 / PAY-14).

## Roles matrix

| Capability | Owner | Member | Viewer |
| --- | --- | --- | --- |
| `team:view` — see team + roster | yes | yes | yes |
| `team:edit` — rename / edit description | yes | yes | — |
| `team:invite` — copy / rotate invite codes | yes | yes | — |
| `member:add` — add members | yes | yes | — |
| `member:change-role` — change roles | yes | — | — |
| `member:remove` — remove members | yes | — | — |
| `team:delete` — delete the team | yes | — | — |

Source: `src/lib/access/roles.ts` (role order), `src/lib/access/permissions.ts`
(matrix), `src/lib/access/guards.ts` (checks). UI: `role-guard.tsx`
(`RoleGuard` / `PermissionGuard`) gates protected controls;
`role-badge.tsx` renders the role chip.

Safety rule: the last owner cannot be demoted or removed
(`lastOwnerGuard` in `guards.ts`, enforced as 409s in the members API).

## Invite flow

1. Creating a team mints an invite code (`HT-XXXXXX`, 7-day TTL) via
   `buildInvite()` in `src/lib/teams/invites.ts`.
2. `POST /api/teams/[teamId]/invite` rotates: revokes active
   `team_invites` rows, inserts a fresh one, stamps `teams.invite_code`,
   and writes an `access_audit` row (`invite:rotate`).
3. `GET /api/teams/[teamId]/invite` returns the active (non-revoked,
   non-expired) invite or `{ invite: null }`.
4. Validation is pure: `validateInvite()` (mismatch / revoked / expired),
   `isInviteExpired()`, `activeInvite()` — shared by client and server.

## Audit

`access_audit` records `team:create`, `member:add`, `member:change-role`,
`member:remove`, and `invite:rotate` with actor + detail. Writes are
best-effort (they never fail the primary mutation).

## Storage modes

- MVP (no `DATABASE_URL`): `useTeams()` in `src/lib/teams/actions.ts`
  persists to localStorage key `hacktrack:teams:v1` (same pattern as
  `src/lib/store.ts`). API routes return 501.
- Neon: Drizzle tables in `src/db/teams-schema.ts` (`teams`,
  `team_members`, `team_invites`, `access_audit`). Join key everywhere is a
  loose `hackathonId: text` — no FK, no edits to the core `hackathons` table.
