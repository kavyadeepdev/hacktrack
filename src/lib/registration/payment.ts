/**
 * Payment-gate helpers (Track A, PAY-10 / PAY-11).
 * Pure functions safe to import from client components and API routes.
 * MVP source of truth is `paymentConfirmed` on the `Hackathon` row
 * (localStorage via `useHackathons()`); the registration API validates
 * transitions and enforces the delete guard with these helpers.
 */
import type { Hackathon } from "@/lib/types";

type Paymentish = Pick<Hackathon, "paymentConfirmed">;
type Datish = Pick<Hackathon, "endDate">;

/** True only when payment was explicitly confirmed. */
export function isPaymentConfirmed(
  hackathon: Paymentish | boolean | null | undefined
): boolean {
  if (typeof hackathon === "boolean") return hackathon;
  if (!hackathon) return false;
  return hackathon.paymentConfirmed === true;
}

/** Normalize checkbox input into a storable value. */
export function toPaymentValue(paid: boolean): boolean {
  return paid === true;
}

/**
 * True when the event is over (end date is before today, day-granular).
 * Missing/unparseable end dates count as "not over".
 */
export function isEventOver(
  hackathon: Datish,
  now: Date = new Date()
): boolean {
  if (!hackathon.endDate) return false;
  const end = new Date(hackathon.endDate);
  if (Number.isNaN(end.getTime())) return false;
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  return end < startOfToday;
}

export type DeleteBlockedReason = "payment_confirmed" | "event_over";

export interface DeleteGuard {
  allowed: boolean;
  reason: DeleteBlockedReason | null;
  message: string | null;
}

/**
 * Deletion is allowed pre-event only: blocked once payment is confirmed
 * or the event is over (PAY-11).
 */
export function canDeleteHackathon(
  hackathon: Paymentish & Datish,
  now: Date = new Date()
): DeleteGuard {
  if (isPaymentConfirmed(hackathon)) {
    return {
      allowed: false,
      reason: "payment_confirmed",
      message: "Deletion is blocked: payment is already confirmed.",
    };
  }
  if (isEventOver(hackathon, now)) {
    return {
      allowed: false,
      reason: "event_over",
      message: "Deletion is blocked: the event is already over.",
    };
  }
  return { allowed: true, reason: null, message: null };
}
