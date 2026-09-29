import type { HackathonStatus, ResultStatus } from "./types";

export const STATUS_ORDER: HackathonStatus[] = [
  "reviewing",
  "planning_to_apply",
  "applied",
  "accepted",
  "attended",
  "declined",
  "skipped",
];

export const STATUS_LABELS: Record<HackathonStatus, string> = {
  reviewing: "Reviewing",
  planning_to_apply: "Planning to apply",
  applied: "Applied",
  accepted: "Accepted",
  attended: "Attended",
  declined: "Declined",
  skipped: "Skipped",
};

export const RESULT_LABELS: Record<ResultStatus, string> = {
  none: "No result yet",
  won: "Won",
  finalist: "Finalist",
  submitted_no_place: "Submitted, no place",
  did_not_submit: "Did not submit",
  no_show: "No-show",
};

export const STATUS_OPTIONS = STATUS_ORDER.map((value) => ({
  value,
  label: STATUS_LABELS[value],
}));

export const RESULT_OPTIONS = (
  Object.keys(RESULT_LABELS) as ResultStatus[]
).map((value) => ({ value, label: RESULT_LABELS[value] }));
