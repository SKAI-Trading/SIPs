import { pathToFileURL } from "node:url";
import { describe, expect, it } from "vitest";
import { git } from "../git.mjs";
import { isShallow, readHistory } from "../history.mjs";
import { addCommit, fullImpact, header, makeRepo, sipText, upgradeHeader } from "../testing.mjs";

const FORUM = "https://forum.skairesear.ch/t/sip-12-open-orders-by-trader-rpc/123/4";

function repoWithHistory() {
  return makeRepo([
    { files: { "SIPS/sip-12.md": sipText(header()) }, message: "Add SIP-12", date: "2026-11-02" },
    {
      files: { "SIPS/sip-12.md": sipText(header({ status: "Review", impact: fullImpact() })) },
      message: `Move SIP-12 to Review (#7)\n\nForum: ${FORUM}`,
      date: "2026-11-20",
    },
    { files: { "SIPS/sip-4.md": sipText(upgradeHeader({}, { proposed: [12] })) }, message: "Record upgrade v4", date: "2026-11-21" },
    {
      files: { "SIPS/sip-4.md": sipText(upgradeHeader({}, { considered: [12], activation: { height: 2_500_000, date: null } })) },
      message: `Consider SIP-12 for v4\n\nForum: ${FORUM}`,
      date: "2026-12-01",
    },
  ]);
}

describe("readHistory", () => {
  it("reads commits with their dates, PR numbers and Forum trailers", () => {
    const { commits } = readHistory(repoWithHistory());
    expect(commits.map(({ date, subject, pr, forum }) => ({ date, subject, pr, forum }))).toEqual([
      { date: "2026-11-02", subject: "Add SIP-12", pr: null, forum: null },
      { date: "2026-11-20", subject: "Move SIP-12 to Review (#7)", pr: 7, forum: FORUM },
      { date: "2026-11-21", subject: "Record upgrade v4", pr: null, forum: null },
      { date: "2026-12-01", subject: "Consider SIP-12 for v4", pr: null, forum: FORUM },
    ]);
  });

  it("turns header changes into events", () => {
    const { events } = readHistory(repoWithHistory());
    // JSON round trip drops the fields an event does not carry; null survives.
    const seen = events.map(({ kind, sip, status, from, to, upgrade, upgradeSip, initial, height, commit }) =>
      JSON.parse(JSON.stringify({ kind, sip, status, from, to, upgrade, upgradeSip, initial, height, on: commit.date })));
    expect(seen).toEqual([
      { kind: "created", sip: 12, status: "Draft", on: "2026-11-02" },
      { kind: "status", sip: 12, from: "Draft", to: "Review", on: "2026-11-20" },
      { kind: "created", sip: 4, status: "Draft", on: "2026-11-21" },
      { kind: "stage", sip: 12, from: null, to: "proposed", upgrade: 4, upgradeSip: 4, initial: true, on: "2026-11-21" },
      { kind: "stage", sip: 12, from: "proposed", to: "considered", upgrade: 4, upgradeSip: 4, initial: false, on: "2026-12-01" },
      { kind: "activation", sip: 4, upgrade: 4, initial: false, height: 2500000, on: "2026-12-01" },
    ]);
  });

  it("reports a deleted SIP", () => {
    const dir = repoWithHistory();
    addCommit(dir, { files: { "SIPS/sip-12.md": null }, message: "Drop SIP-12", date: "2026-12-05" });
    expect(readHistory(dir).events.at(-1)).toMatchObject({ kind: "deleted", sip: 12 });
  });

  it("skips a version that does not parse and compares the next one with the last good one", () => {
    const dir = repoWithHistory();
    addCommit(dir, { files: { "SIPS/sip-12.md": "not a sip" }, message: "Break it", date: "2026-12-05" });
    addCommit(dir, { files: { "SIPS/sip-12.md": sipText(header({ status: "Draft", impact: fullImpact() })) }, message: `Back to Draft\n\nForum: ${FORUM}`, date: "2026-12-06" });
    expect(readHistory(dir).events.at(-1)).toMatchObject({ kind: "status", sip: 12, from: "Review", to: "Draft" });
  });

  it("uses a given head message for the last commit", () => {
    const dir = repoWithHistory();
    const { commits } = readHistory(dir, { headMessage: `Consider SIP-12 for v4 (#9)\n\nForum: ${FORUM}` });
    expect(commits.at(-1)).toMatchObject({ pr: 9, forum: FORUM });
  });
});

describe("isShallow", () => {
  it("tells a full clone from a shallow one", () => {
    const dir = repoWithHistory();
    expect(isShallow(dir)).toBe(false);
    const shallow = `${dir}-shallow`;
    git(dir, ["clone", "-q", "--depth", "1", pathToFileURL(dir).href, shallow]);
    expect(isShallow(shallow)).toBe(true);
  });
});
