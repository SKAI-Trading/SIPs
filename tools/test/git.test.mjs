import { mkdtempSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { git, gitBinary } from "../git.mjs";
import { makeRepo } from "../testing.mjs";

const NAME = process.platform === "win32" ? "git.exe" : "git";

function folderWithFakeGit() {
  const dir = mkdtempSync(path.join(os.tmpdir(), "fake-git-"));
  writeFileSync(path.join(dir, NAME), "");
  return dir;
}

describe("gitBinary", () => {
  it("returns an absolute path to git on this machine", () => {
    const binary = gitBinary();
    expect(path.isAbsolute(binary)).toBe(true);
    expect(path.basename(binary).toLowerCase()).toBe(NAME);
  });

  it("skips relative PATH entries, which resolve against the working folder", () => {
    const planted = folderWithFakeGit();
    const real = folderWithFakeGit();
    const relative = path.relative(process.cwd(), planted);
    expect(path.isAbsolute(relative)).toBe(false);
    expect(gitBinary({ PATH: [relative, real].join(path.delimiter) })).toBe(path.join(real, NAME));
  });

  it("throws when git is not on PATH", () => {
    expect(() => gitBinary({ PATH: mkdtempSync(path.join(os.tmpdir(), "no-git-")) })).toThrow(`${NAME} is not on PATH`);
  });
});

describe("makeRepo", () => {
  it("writes commits with the given files, messages and dates", () => {
    const dir = makeRepo([
      { files: { "SIPS/sip-1.md": "one" }, message: "Add SIP-1", date: "2026-01-02" },
      { files: { "SIPS/sip-1.md": null, "SIPS/sip-2.md": "two" }, message: "Replace it\n\nForum: https://forum.skairesear.ch/t/x/1", date: "2026-01-03" },
    ]);
    const log = git(dir, ["log", "--format=%ct %s"]).trim().split("\n").map((line) => {
      const [epoch, ...subject] = line.split(" ");
      return [new Date(Number(epoch) * 1000).toISOString(), subject.join(" ")];
    });
    expect(log).toEqual([
      ["2026-01-03T12:00:00.000Z", "Replace it"],
      ["2026-01-02T12:00:00.000Z", "Add SIP-1"],
    ]);
    expect(git(dir, ["ls-files"]).trim()).toBe("SIPS/sip-2.md");
  });
});
