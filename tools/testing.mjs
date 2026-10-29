import { stringify } from "yaml";
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
