import { describe, expect, it } from "vitest";
import { parseSip } from "../parse.mjs";
import { checkHeader, checkSections } from "../rules.mjs";
import { FULL_BODY, fullImpact, header, sipText, upgradeHeader } from "../testing.mjs";

const FILE = "SIPS/sip-12.md";
const problems = (fields) => checkHeader(fields, FILE);
const sectionProblems = (fields, body = FULL_BODY) => checkSections(parseSip(sipText(fields, body), FILE), FILE);

describe("checkHeader", () => {
  it("passes a complete Draft", () => {
    expect(problems(header())).toEqual([]);
  });

  it("names a missing field and an unknown one", () => {
    expect(problems(header({ summary: undefined }))).toEqual([`${FILE}: header is missing summary`]);
    expect(problems(header({ editor: "x" }))).toEqual([`${FILE}: header has an unknown field editor`]);
  });

  it("limits the title to 44 characters", () => {
    expect(problems(header({ title: "x".repeat(45) }))).toEqual([`${FILE}: title must NOT have more than 44 characters`]);
  });

  it("wants discussions-to on the forum", () => {
    expect(problems(header({ "discussions-to": "https://github.com/SKAI-Trading/SIPs/pull/3" }))[0]).toMatch(/discussions-to must match pattern/);
  });

  it("refuses a SIP number in the title", () => {
    expect(problems(header({ title: "SIP-12 open orders" }))).toEqual([`${FILE}: title must not repeat a SIP number`]);
  });

  it("wants a GitHub handle among the authors", () => {
    expect(problems(header({ author: "Jane Doe <jane@example.com>" }))).toEqual([`${FILE}: author needs at least one GitHub handle, as Name (@handle)`]);
  });

  it("ties category to Standards Track", () => {
    expect(problems(header({ category: undefined }))).toEqual([`${FILE}: a Standards Track SIP needs a category`]);
    expect(problems(header({ type: "Informational" }))).toEqual([`${FILE}: only a Standards Track SIP has a category`]);
  });

  it("ties last-call-deadline to Last Call", () => {
    expect(problems(header({ status: "Last Call", impact: fullImpact() }))).toEqual([`${FILE}: Last Call needs last-call-deadline`]);
    expect(problems(header({ "last-call-deadline": "2026-12-01" }))).toEqual([`${FILE}: last-call-deadline belongs only to Last Call`]);
  });

  it("ties withdrawal-reason to Withdrawn", () => {
    expect(problems(header({ status: "Withdrawn" }))).toEqual([`${FILE}: Withdrawn needs withdrawal-reason`]);
  });

  it("keeps Living for Meta SIPs", () => {
    expect(problems(header({ status: "Living" }))).toEqual([`${FILE}: only a Meta SIP can be Living`]);
  });

  it("wants every audience on a Standards Track SIP from Review on", () => {
    expect(problems(header({ status: "Review", impact: { traders: "Faster." } }))).toEqual([
      `${FILE}: impact needs every audience from Review on; missing market-makers, validators, app-developers, wallets, players, holders`,
    ]);
    expect(problems(header({ status: "Review", impact: fullImpact() }))).toEqual([]);
    expect(problems(upgradeHeader({ status: "Review" }))).toEqual([]);
  });

  it("keeps the upgrade block for Meta SIPs", () => {
    const { upgrade } = upgradeHeader();
    expect(problems(header({ upgrade }))).toEqual([`${FILE}: only a Meta SIP records an upgrade`]);
  });

  it("refuses a SIP listed under two stages", () => {
    expect(problems(upgradeHeader({}, { proposed: [12], considered: [12] }))).toEqual([`${FILE}: SIP-12 is listed under both proposed and considered`]);
  });

  it("closes the open stages once an upgrade has activated", () => {
    expect(problems(upgradeHeader({}, { proposed: [13], included: [12] }))).toEqual([`${FILE}: an activated upgrade cannot still list SIPs under proposed`]);
    expect(problems(upgradeHeader({}, { scheduled: [13], activation: { height: 900, date: "2026-12-01" } }))).toEqual([`${FILE}: an activated upgrade cannot still list SIPs under scheduled`]);
    expect(problems(upgradeHeader({ status: "Final" }, { considered: [13] }))).toEqual([`${FILE}: an activated upgrade cannot still list SIPs under considered`]);
    expect(problems(upgradeHeader({}, { scheduled: [13], activation: { height: 900, date: null } }))).toEqual([]);
  });
});

describe("checkSections", () => {
  it("passes the full body", () => {
    expect(sectionProblems(header())).toEqual([]);
  });

  it("names every missing section", () => {
    const body = FULL_BODY.replace("## Rationale", "## Reasons").replace("## Security Considerations", "## Risks");
    expect(sectionProblems(header(), body)).toEqual([`${FILE}: missing sections Rationale, Security Considerations`]);
  });

  it("wants Test Cases on Core and Market SIPs from Last Call on", () => {
    const fields = header({ category: "Market", status: "Last Call", "last-call-deadline": "2026-12-01", impact: fullImpact() });
    expect(sectionProblems(fields)).toEqual([`${FILE}: a Market SIP needs Test Cases from Last Call on`]);
    expect(sectionProblems(fields, FULL_BODY.replace("## Copyright", "## Test Cases\n\nVectors.\n\n## Copyright"))).toEqual([]);
  });

  it("wants the CC0 waiver", () => {
    expect(sectionProblems(header(), FULL_BODY.replace("[CC0](../LICENSE)", "the usual terms"))).toEqual([`${FILE}: the Copyright section must waive rights under CC0`]);
  });
});
