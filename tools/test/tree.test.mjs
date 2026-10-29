import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { loadTree } from "../tree.mjs";
import { header, sipText, upgradeHeader } from "../testing.mjs";

function tree(files) {
  const dir = mkdtempSync(path.join(os.tmpdir(), "sips-tree-"));
  mkdirSync(path.join(dir, "SIPS"));
  for (const [name, text] of Object.entries(files)) writeFileSync(path.join(dir, "SIPS", name), text);
  return dir;
}

describe("loadTree", () => {
  it("loads valid SIPs in number order", () => {
    const dir = tree({
      "sip-12.md": sipText(header()),
      "sip-3.md": sipText(header({ sip: 3, "discussions-to": "https://forum.skairesear.ch/t/sip-3/30" })),
    });
    const { sips, problems } = loadTree(dir);
    expect(problems).toEqual([]);
    expect(sips.map((sip) => sip.header.sip)).toEqual([3, 12]);
  });

  it("treats a missing SIPS folder as no SIPs", () => {
    expect(loadTree(mkdtempSync(path.join(os.tmpdir(), "sips-empty-")))).toEqual({ sips: [], problems: [] });
  });

  it("names a misnamed file and a number that disagrees with the file name", () => {
    const dir = tree({ "proposal.md": sipText(header()), "sip-13.md": sipText(header()) });
    expect(loadTree(dir).problems).toEqual([
      "SIPS/proposal.md: a SIP file is named sip-<number>.md",
      "SIPS/sip-13.md: the header says sip 12 but the file name says 13",
    ]);
  });

  it("checks references to other SIPs", () => {
    const dir = tree({ "sip-12.md": sipText(header({ requires: [9] })) });
    expect(loadTree(dir).problems).toEqual(["SIPS/sip-12.md: requires SIP-9, which does not exist"]);
  });

  it("checks the SIPs an upgrade lists and that each version is recorded once", () => {
    const dir = tree({
      "sip-4.md": sipText(upgradeHeader({}, { proposed: [12, 30] })),
      "sip-5.md": sipText(upgradeHeader({ sip: 5, "discussions-to": "https://forum.skairesear.ch/t/upgrade-v4-again/50" }, { proposed: [5] })),
      "sip-12.md": sipText(header()),
    });
    expect(loadTree(dir).problems).toEqual([
      "SIPS/sip-4.md: lists SIP-30 under proposed, which does not exist",
      "SIPS/sip-5.md: upgrade v4 is already recorded by SIPS/sip-4.md",
      "SIPS/sip-5.md: an upgrade cannot list its own SIP",
    ]);
  });

  it("keeps a SIP with a bad header out of the list but reports it", () => {
    const dir = tree({ "sip-12.md": sipText(header({ status: "Accepted" })) });
    const { sips, problems } = loadTree(dir);
    expect(sips).toEqual([]);
    expect(problems).toEqual(["SIPS/sip-12.md: status must be equal to one of the allowed values"]);
  });
});
