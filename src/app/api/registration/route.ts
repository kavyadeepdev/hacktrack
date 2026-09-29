/**
 * Registration API (Track A, PAY-10 / PAY-11).
 * MVP note: hackathon rows live in localStorage (`useHackathons()`), so
 * this route is a stateless validator + guard, not a datastore. It
 * validates payment transitions and enforces the pre-event-only delete
 * guard (blocked once payment is confirmed or the event is over).
 */
import {
  canDeleteHackathon,
  isPaymentConfirmed,
  toPaymentValue,
} from "@/lib/registration/payment";

interface PaymentBody {
  hackathonId?: unknown;
  paid?: unknown;
  paymentConfirmed?: unknown;
}

interface DeleteBody {
  hackathonId?: unknown;
  paid?: unknown;
  paymentConfirmed?: unknown;
  endDate?: unknown;
}

function parsePaymentBody(value: unknown): {
  hackathonId: string;
  paid: boolean;
} | null {
  if (typeof value !== "object" || value === null) return null;
  const body = value as PaymentBody;
  if (typeof body.hackathonId !== "string" || body.hackathonId.length === 0) {
    return null;
  }
  const raw = body.paid ?? body.paymentConfirmed;
  if (typeof raw !== "boolean") return null;
  return { hackathonId: body.hackathonId, paid: toPaymentValue(raw) };
}

export async function GET() {
  return Response.json({
    status: "ok",
    hint: "PATCH { hackathonId, paid } to set payment; DELETE { hackathonId, paymentConfirmed?, endDate? } checks the pre-event-only delete guard.",
  });
}

/** Validate + echo a payment transition (persistence stays client-side). */
export async function PATCH(request: Request) {
  let json: unknown = null;
  try {
    json = await request.json();
  } catch {
    return Response.json({ message: "Invalid JSON body." }, { status: 400 });
  }
  const parsed = parsePaymentBody(json);
  if (!parsed) {
    return Response.json(
      {
        message:
          "Body must be { hackathonId: string, paid: boolean } (paymentConfirmed accepted as alias).",
      },
      { status: 400 }
    );
  }
  return Response.json({
    hackathonId: parsed.hackathonId,
    paymentConfirmed: isPaymentConfirmed(parsed.paid),
  });
}

/**
 * Pre-event-only delete guard. Returns 200 when deletion may proceed,
 * 409 with a reason when blocked (payment confirmed or event over).
 */
export async function DELETE(request: Request) {
  let json: unknown = null;
  try {
    json = await request.json();
  } catch {
    return Response.json({ message: "Invalid JSON body." }, { status: 400 });
  }
  if (typeof json !== "object" || json === null) {
    return Response.json(
      { message: "Body must include hackathonId." },
      { status: 400 }
    );
  }
  const body = json as DeleteBody;
  if (typeof body.hackathonId !== "string" || body.hackathonId.length === 0) {
    return Response.json(
      { message: "Body must include hackathonId." },
      { status: 400 }
    );
  }
  const rawPayment = body.paid ?? body.paymentConfirmed ?? false;
  const paymentConfirmed =
    typeof rawPayment === "boolean" ? rawPayment : false;
  const endDate =
    typeof body.endDate === "string" || body.endDate === null
      ? body.endDate
      : undefined;
  const guard = canDeleteHackathon({
    paymentConfirmed,
    endDate: endDate ?? null,
  });
  if (!guard.allowed) {
    return Response.json(
      {
        hackathonId: body.hackathonId,
        allowed: false,
        reason: guard.reason,
        message: guard.message,
      },
      { status: 409 }
    );
  }
  return Response.json({ hackathonId: body.hackathonId, allowed: true });
}
