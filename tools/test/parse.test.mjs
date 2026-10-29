import { describe, expect, it } from "vitest";
import { parseSip } from "../parse.mjs";

describe("parseSip", () => {
  it("splits the header from the body and lists the level-two sections", () => {
    const sip = parseSip("---\nsip: 7\ntitle: Example\n---\n## Abstract\n\nText.\n\n## Specification\n", "SIPS/sip-7.md");
    expect(sip.problems).toEqual([]);
    expect(sip.header).toEqual({ sip: 7, title: "Example" });
    expect(sip.sections).toEqual(["Abstract", "Specification"]);
  });

  it("keeps dates as strings", () => {
    const sip = parseSip("---\ncreated: 2026-11-02\n---\n", "SIPS/sip-1.md");
    expect(sip.header.created).toBe("2026-11-02");
  });

  it("ignores headings inside fenced code", () => {
    const sip = parseSip("---\nsip: 1\n---\n## Abstract\n\n```\n## Not a section\n```\n\n## Rationale\n", "SIPS/sip-1.md");
    expect(sip.sections).toEqual(["Abstract", "Rationale"]);
  });

  it("accepts CRLF line endings", () => {
    const sip = parseSip("---\r\nsip: 3\r\n---\r\n## Abstract\r\n", "SIPS/sip-3.md");
    expect(sip.header).toEqual({ sip: 3 });
    expect(sip.sections).toEqual(["Abstract"]);
  });

  it("reports a file with no header", () => {
    const sip = parseSip("## Abstract\n", "SIPS/sip-9.md");
    expect(sip.header).toBeNull();
    expect(sip.problems).toEqual(["SIPS/sip-9.md: no header (the file must open with a --- block)"]);
  });

  it("reports YAML that does not parse", () => {
    const sip = parseSip("---\ntitle: [unclosed\n---\n", "SIPS/sip-9.md");
    expect(sip.header).toBeNull();
    expect(sip.problems[0]).toMatch(/^SIPS\/sip-9\.md: the header is not valid YAML: /);
  });

  it("reports a header that is not a mapping", () => {
    const sip = parseSip("---\n- a\n- b\n---\n", "SIPS/sip-9.md");
    expect(sip.header).toBeNull();
    expect(sip.problems).toEqual(["SIPS/sip-9.md: the header must be a mapping of fields"]);
  });
});
