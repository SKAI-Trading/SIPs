import { git } from "./git.mjs";
import { parseSip } from "./parse.mjs";
import { STAGES } from "./rules.mjs";

const SIP_PATH = /^SIPS\/sip-(\d+)\.md$/;
const RECORD = "\x1e";
const FIELD = "\x1f";
const FORUM_TRAILER = /^Forum:\s*(https:\/\/forum\.skairesear\.ch\/t\/[a-z0-9-]+\/\d+(?:\/\d+)?)\s*$/m;
const PR_SUFFIX = /\(#(\d+)\)\s*$/;

export function isShallow(repoDir) {
  return git(repoDir, ["rev-parse", "--is-shallow-repository"]).trim() === "true";
}

export function readHistory(repoDir, { headMessage } = {}) {
  const log = git(repoDir, [
    "log", "--first-parent", "--reverse", "-m", "--no-renames", "--name-status",
    `--format=${RECORD}%H${FIELD}%cI${FIELD}%B${FIELD}`, "--", "SIPS",
  ]);
  const commits = log.split(RECORD).filter((record) => record.trim()).map(parseRecord);
  if (headMessage !== undefined && commits.length > 0) {
    const head = git(repoDir, ["rev-parse", "HEAD"]).trim();
    const last = commits.at(-1);
    if (last.sha === head) Object.assign(last, describeMessage(headMessage));
  }

  const current = new Map();
  const events = [];
  for (const commit of commits) {
    for (const { status, file } of commit.changes) {
      const match = SIP_PATH.exec(file);
      if (!match) continue;
      const sip = Number(match[1]);
      if (status === "D") {
        events.push({ kind: "deleted", sip, commit });
        current.delete(sip);
        continue;
      }
      const { header } = parseSip(git(repoDir, ["show", `${commit.sha}:${file}`]), file);
      if (!header) continue;
      events.push(...diff(sip, current.get(sip) ?? null, header, commit));
      current.set(sip, header);
    }
  }
  return { commits, events };
}

function parseRecord(record) {
  const [sha, stamp, message, changes = ""] = record.split(FIELD);
  return {
    sha: sha.trim(),
    date: stamp.slice(0, 10),
    ...describeMessage(message),
    changes: changes
      .split("\n")
      .map((line) => line.split("\t"))
      .filter((parts) => parts.length === 2)
      .map(([status, file]) => ({ status: status[0], file })),
  };
}

function describeMessage(message) {
  const subject = message.trim().split("\n", 1)[0].trim();
  return {
    subject,
    pr: Number(PR_SUFFIX.exec(subject)?.[1]) || null,
    forum: FORUM_TRAILER.exec(message)?.[1] ?? null,
  };
}

function diff(sip, before, after, commit) {
  if (!before) {
    return [
      { kind: "created", sip, status: after.status, header: after, commit },
      ...upgradeEvents(sip, undefined, after.upgrade, commit, true),
    ];
  }
  const events = [];
  if (before.status !== after.status) events.push({ kind: "status", sip, from: before.status, to: after.status, before, after, commit });
  if (before.upgrade || after.upgrade) events.push(...upgradeEvents(sip, before.upgrade, after.upgrade, commit, false));
  return events;
}

function upgradeEvents(upgradeSip, before, after, commit, initial) {
  if (!before && !after) return [];
  const upgrade = (after ?? before).version;
  const was = stageMap(before);
  const now = stageMap(after);
  const events = [];
  for (const sip of new Set([...was.keys(), ...now.keys()])) {
    const from = was.get(sip) ?? null;
    const to = now.get(sip) ?? null;
    if (from !== to) events.push({ kind: "stage", sip, upgrade, upgradeSip, from, to, initial, commit });
  }
  const rolloutBefore = before?.rollout?.date ?? null;
  const rolloutAfter = after?.rollout?.date ?? null;
  if (rolloutBefore !== rolloutAfter) events.push({ kind: "rollout", sip: upgradeSip, upgrade, date: rolloutAfter, initial, commit });
  const heightAfter = after?.activation?.height ?? null;
  const dateAfter = after?.activation?.date ?? null;
  if ((before?.activation?.height ?? null) !== heightAfter || (before?.activation?.date ?? null) !== dateAfter) {
    events.push({ kind: "activation", sip: upgradeSip, upgrade, height: heightAfter, date: dateAfter, initial, commit });
  }
  return events;
}

function stageMap(upgrade) {
  const map = new Map();
  for (const stage of STAGES) for (const sip of upgrade?.[stage] ?? []) map.set(sip, stage);
  return map;
}
