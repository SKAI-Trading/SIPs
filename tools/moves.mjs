const MOVES = {
  Draft: ["Review", "Withdrawn", "Stagnant"],
  Review: ["Draft", "Final Review", "Withdrawn", "Stagnant"],
  "Final Review": ["Review", "Final", "Withdrawn", "Stagnant"],
  Stagnant: ["Draft", "Review"],
  Final: [],
  Withdrawn: [],
  Living: [],
};
const FINAL_REVIEW_DAYS = 14;
const DAY_MS = 86_400_000;

export function checkMove(before, after, date) {
  if (before.status === after.status) return null;
  if (!(MOVES[before.status] ?? []).includes(after.status)) return `${before.status} cannot move to ${after.status}`;
  if (after.status === "Final Review") {
    const deadline = after["final-review-deadline"];
    if (!deadline || daysBetween(date, deadline) < FINAL_REVIEW_DAYS) return `Final Review needs a deadline at least ${FINAL_REVIEW_DAYS} days after ${date}`;
  }
  if (after.status === "Final" && !(date > before["final-review-deadline"])) {
    return `Final before the Final Review deadline ${before["final-review-deadline"]}`;
  }
  return null;
}

export function checkStart(header) {
  if (header.status === "Draft") return null;
  if (header.type === "Meta" && header.status === "Living") return null;
  if (header.type === "Meta" && header.status === "Final" && header.upgrade) return null;
  return `a new SIP starts as Draft, not ${header.status}`;
}

function daysBetween(from, to) {
  return (Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / DAY_MS;
}
