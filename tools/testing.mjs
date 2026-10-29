import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { stringify } from "yaml";
import { git } from "./git.mjs";
import { AUDIENCES } from "./rules.mjs";

export const FULL_BODY = [
  "## Abstract", "", "One paragraph.", "",
  "## Motivation", "", "Why it is needed.", "",
  "## Specification", "", "What changes.", "",
  "## Rationale", "", "Why this way.", "",
  "## Backwards Compatibility", "", "None.", "",
  "## Security Considerations", "", "None found.", "",
  "## Copyright", "", "Copyright and related rights waived via [CC0](../LICENSE).", "",
].join("\n");

export function header(overrides = {}) {
  const merged = {
    sip: 12,
    title: "Open orders by trader RPC",
    description: "One RPC call returns every open order a trader has across all markets",
    author: "Jane Doe (@janedoe)",
    "discussions-to": "https://forum.skairesear.ch/t/sip-12-open-orders-by-trader-rpc/123",
    status: "Draft",
    type: "Standards Track",
    category: "Interface",
    created: "2026-11-02",
    summary: "Showing a trader's open orders takes one call per market. This adds one read-only call.",
    ...overrides,
  };
  for (const [key, value] of Object.entries(merged)) if (value === undefined) delete merged[key];
  return merged;
}

export function upgradeHeader(overrides = {}, upgrade = {}) {
  return header({
    sip: 4,
    title: "Upgrade v4",
    description: "The SIPs in chain upgrade v4 and where each one stands",
    "discussions-to": "https://forum.skairesear.ch/t/upgrade-v4/40",
    type: "Meta",
    category: undefined,
    summary: "What chain upgrade v4 changes.",
    upgrade: {
      version: 4,
      proposed: [],
      considered: [],
      scheduled: [],
      declined: [],
      included: [],
      rollout: { date: null },
      activation: { height: null, date: null },
      ...upgrade,
    },
    ...overrides,
  });
}

export function fullImpact(text = "No change.") {
  return Object.fromEntries(AUDIENCES.map((key) => [key, text]));
}

export function sipText(fields, body = FULL_BODY) {
  return `---\n${stringify(fields, { lineWidth: 0 })}---\n\n${body}`;
}

export function makeRepo(commits) {
  const dir = mkdtempSync(path.join(os.tmpdir(), "sips-repo-"));
  git(dir, ["init", "-q", "-b", "main"]);
  git(dir, ["config", "user.name", "SIP Test"]);
  git(dir, ["config", "user.email", "sip-test@example.invalid"]);
  git(dir, ["config", "commit.gpgsign", "false"]);
  git(dir, ["config", "core.autocrlf", "false"]);
  for (const commit of commits) addCommit(dir, commit);
  return dir;
}

export function addCommit(dir, { files = {}, message, date }) {
  for (const [file, text] of Object.entries(files)) {
    const target = path.join(dir, file);
    if (text === null) rmSync(target);
    else {
      mkdirSync(path.dirname(target), { recursive: true });
      writeFileSync(target, text);
    }
  }
  git(dir, ["add", "-A"]);
  const stamp = `${date}T12:00:00Z`;
  git(dir, ["commit", "-q", "--allow-empty", "-m", message], {
    env: { ...process.env, GIT_AUTHOR_DATE: stamp, GIT_COMMITTER_DATE: stamp },
  });
}
