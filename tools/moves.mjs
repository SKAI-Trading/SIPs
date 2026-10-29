const MOVES = {
  Draft: ["Review", "Withdrawn", "Stagnant"],
  Review: ["Draft", "Last Call", "Withdrawn", "Stagnant"],
  "Last Call": ["Review", "Final", "Withdrawn", "Stagnant"],
  Stagnant: ["Draft", "Review"],
  Final: [],
  Withdrawn: [],
  Living: [],
};
const LAST_CALL_DAYS = 14;
const DAY_MS = 86_400_000;

export function checkMove(before, after, date) {
  if (before.status === after.status) return null;
  if (!(MOVES[before.status] ?? []).includes(after.status)) return `${before.status} cannot move to ${after.status}`;
  if (after.status === "Last Call") {
    const deadline = after["last-call-deadline"];
    if (!deadline || daysBetween(date, deadline) < LAST_CALL_DAYS) return `Last Call needs a deadline at least ${LAST_CALL_DAYS} days after ${date}`;
  }
  if (after.status === "Final" && !(date > before["last-call-deadline"])) {
    return `Final before the Last Call deadline ${before["last-call-deadline"]}`;
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
