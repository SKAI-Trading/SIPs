import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { isShallow, readHistory } from "./history.mjs";
import { checkMove, checkStart } from "./moves.mjs";
import { loadTree } from "./tree.mjs";

export function checkRepo(repoDir, { treeOnly = false, headMessage } = {}) {
  const { problems } = loadTree(repoDir);
  if (treeOnly) return problems;
  if (isShallow(repoDir)) {
    return [...problems, "the history check needs full history and this clone is shallow; fetch with --unshallow, or run --tree-only"];
  }
  const { events } = readHistory(repoDir, { headMessage });
  return [...problems, ...historyProblems(events, readExceptions(repoDir))];
}

export function historyProblems(events, exceptions = {}) {
  const problems = [];
  for (const event of events) {
    if (Object.hasOwn(exceptions, event.commit.sha)) continue;
    const where = `${event.commit.sha.slice(0, 8)} SIP-${event.kind === "stage" ? event.upgradeSip : event.sip}`;
    if (event.kind === "deleted") problems.push(`${where}: a SIP file is never deleted; withdraw the SIP instead`);
    if (event.kind === "created") {
      const why = checkStart(event.header);
      if (why) problems.push(`${where}: ${why}`);
    }
    if (event.kind === "status") {
      const why = checkMove(event.before, event.after, event.commit.date);
      if (why) problems.push(`${where}: ${why}`);
      if (!event.commit.forum) problems.push(`${where}: a status change needs a Forum: trailer`);
    }
    if (event.kind === "stage" && !event.initial && !event.commit.forum) {
      problems.push(`${where}: moving SIP-${event.sip} in upgrade v${event.upgrade} needs a Forum: trailer`);
    }
  }
  return problems;
}

// A problem in published history cannot be fixed by rewriting a public repo, so an editor
// accepts it by listing the commit's full sha here with a reason. Without this file one bad
// commit would hold the gate red forever.
function readExceptions(repoDir) {
  const file = path.join(repoDir, "history-exceptions.json");
  return existsSync(file) ? JSON.parse(readFileSync(file, "utf8")) : {};
}
