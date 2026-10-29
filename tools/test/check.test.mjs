import { writeFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { describe, expect, it } from "vitest";
import { git } from "../git.mjs";
import { checkRepo } from "../check.mjs";
import { addCommit, fullImpact, header, makeRepo, sipText, upgradeHeader } from "../testing.mjs";

const FORUM = "https://forum.skairesear.ch/t/sip-12-open-orders-by-trader-rpc/123";

function goodRepo() {
  return makeRepo([
    { files: { "SIPS/sip-12.md": sipText(header()) }, message: "Add SIP-12", date: "2026-11-02" },
    { files: { "SIPS/sip-12.md": sipText(header({ status: "Review", impact: fullImpact() })) }, message: `Move SIP-12 to Review\n\nForum: ${FORUM}`, date: "2026-11-20" },
  ]);
}

describe("checkRepo", () => {
  it("passes a clean repo", () => {
    expect(checkRepo(goodRepo())).toEqual([]);
  });

  it("refuses a status change without a Forum trailer", () => {
    const dir = goodRepo();
    addCommit(dir, { files: { "SIPS/sip-12.md": sipText(header({ status: "Draft", impact: fullImpact() })) }, message: "Back to Draft", date: "2026-11-22" });
    const sha = git(dir, ["rev-parse", "--short=8", "HEAD"]).trim();
    expect(checkRepo(dir)).toEqual([`${sha} SIP-12: a status change needs a Forum: trailer`]);
  });

  it("refuses a move SIP-1 does not allow", () => {
    const dir = goodRepo();
    addCommit(dir, { files: { "SIPS/sip-12.md": sipText(header({ status: "Final", impact: fullImpact() })) }, message: `Finalize\n\nForum: ${FORUM}`, date: "2026-11-22" });
    const sha = git(dir, ["rev-parse", "--short=8", "HEAD"]).trim();
    expect(checkRepo(dir)).toEqual([`${sha} SIP-12: Review cannot move to Final`]);
  });

  it("refuses a new SIP that does not start as Draft", () => {
    const dir = makeRepo([{ files: { "SIPS/sip-12.md": sipText(header({ status: "Review", impact: fullImpact() })) }, message: "Add SIP-12", date: "2026-11-02" }]);
    const sha = git(dir, ["rev-parse", "--short=8", "HEAD"]).trim();
    expect(checkRepo(dir)).toEqual([`${sha} SIP-12: a new SIP starts as Draft, not Review`]);
  });

  it("refuses a stage move without a Forum trailer but not an upgrade's first lists", () => {
    const dir = goodRepo();
    addCommit(dir, { files: { "SIPS/sip-4.md": sipText(upgradeHeader({}, { proposed: [12] })) }, message: "Record upgrade v4", date: "2026-11-21" });
    expect(checkRepo(dir)).toEqual([]);
    addCommit(dir, { files: { "SIPS/sip-4.md": sipText(upgradeHeader({}, { considered: [12] })) }, message: "Consider SIP-12", date: "2026-11-25" });
    const sha = git(dir, ["rev-parse", "--short=8", "HEAD"]).trim();
    expect(checkRepo(dir)).toEqual([`${sha} SIP-4: moving SIP-12 in upgrade v4 needs a Forum: trailer`]);
  });

  it("refuses a deleted SIP unless an editor listed the commit as an exception", () => {
    const dir = goodRepo();
    addCommit(dir, { files: { "SIPS/sip-12.md": null }, message: "Drop SIP-12", date: "2026-11-22" });
    const sha = git(dir, ["rev-parse", "HEAD"]).trim();
    expect(checkRepo(dir)).toEqual([`${sha.slice(0, 8)} SIP-12: a SIP file is never deleted; withdraw the SIP instead`]);
    writeFileSync(path.join(dir, "history-exceptions.json"), JSON.stringify({ [sha]: "removed a duplicate filed by mistake" }));
    expect(checkRepo(dir)).toEqual([]);
  });

  it("reads the trailer from a given head message", () => {
    const dir = goodRepo();
    addCommit(dir, { files: { "SIPS/sip-12.md": sipText(header({ status: "Draft", impact: fullImpact() })) }, message: "Merge pull request", date: "2026-11-22" });
    expect(checkRepo(dir, { headMessage: `Back to Draft (#5)\n\nForum: ${FORUM}` })).toEqual([]);
  });

  it("will not run the history check on a shallow clone, but the tree check runs", () => {
    const dir = goodRepo();
    const shallow = `${dir}-shallow`;
    git(dir, ["clone", "-q", "--depth", "1", pathToFileURL(dir).href, shallow]);
    expect(checkRepo(shallow)).toEqual(["the history check needs full history and this clone is shallow; fetch with --unshallow, or run --tree-only"]);
    expect(checkRepo(shallow, { treeOnly: true })).toEqual([]);
  });

  it("reports tree problems too", () => {
    const dir = goodRepo();
    addCommit(dir, { files: { "SIPS/sip-13.md": sipText(header({ sip: 13, requires: [99], "discussions-to": "https://forum.skairesear.ch/t/sip-13/130" })) }, message: "Add SIP-13", date: "2026-11-23" });
    expect(checkRepo(dir)).toEqual(["SIPS/sip-13.md: requires SIP-99, which does not exist"]);
  });
});
