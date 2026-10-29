import { readFileSync } from "node:fs";
import Ajv2020 from "ajv/dist/2020.js";

export const AUDIENCES = ["traders", "market-makers", "validators", "app-developers", "wallets", "players", "holders"];
export const STAGES = ["proposed", "considered", "scheduled", "declined", "included"];
export const REQUIRED_SECTIONS = ["Abstract", "Motivation", "Specification", "Rationale", "Backwards Compatibility", "Security Considerations", "Copyright"];

const OPEN_STAGES = ["proposed", "considered", "scheduled"];
const IMPACT_FROM = new Set(["Review", "Last Call", "Final"]);
const TEST_CASES_FROM = new Set(["Last Call", "Final"]);

const schema = JSON.parse(readFileSync(new URL("../schema/sip.schema.json", import.meta.url), "utf8"));
const validate = new Ajv2020({ allErrors: true, allowUnionTypes: true }).compile(schema);

export function checkHeader(header, file) {
  if (!validate(header)) return validate.errors.map((error) => `${file}: ${describe(error)}`);

  const problems = [];
  const say = (text) => problems.push(`${file}: ${text}`);
  const standards = header.type === "Standards Track";

  for (const field of ["title", "description"]) {
    if (/\bSIP-?\s*\d/i.test(header[field])) say(`${field} must not repeat a SIP number`);
  }
  if (!/\(@[A-Za-z0-9-]+\)/.test(header.author)) say("author needs at least one GitHub handle, as Name (@handle)");
  if (standards && !header.category) say("a Standards Track SIP needs a category");
  if (!standards && header.category) say("only a Standards Track SIP has a category");
  if (header.status === "Last Call" && !header["last-call-deadline"]) say("Last Call needs last-call-deadline");
  if (header.status !== "Last Call" && header["last-call-deadline"]) say("last-call-deadline belongs only to Last Call");
  if (header.status === "Withdrawn" && !header["withdrawal-reason"]) say("Withdrawn needs withdrawal-reason");
  if (header.status !== "Withdrawn" && header["withdrawal-reason"]) say("withdrawal-reason belongs only to Withdrawn");
  if (header.status === "Living" && header.type !== "Meta") say("only a Meta SIP can be Living");
  if (standards && IMPACT_FROM.has(header.status)) {
    const missing = AUDIENCES.filter((key) => !header.impact?.[key]);
    if (missing.length) say(`impact needs every audience from Review on; missing ${missing.join(", ")}`);
  }
  if (header.upgrade) {
    if (header.type !== "Meta") say("only a Meta SIP records an upgrade");
    else problems.push(...checkUpgrade(header, file));
  }
  return problems;
}

function checkUpgrade(header, file) {
  const { upgrade } = header;
  const problems = [];
  const seen = new Map();
  for (const stage of STAGES) {
    for (const sip of upgrade[stage]) {
      if (seen.has(sip)) problems.push(`${file}: SIP-${sip} is listed under both ${seen.get(sip)} and ${stage}`);
      else seen.set(sip, stage);
    }
  }
  const activated = upgrade.activation.date !== null || upgrade.included.length > 0 || header.status === "Final";
  const open = OPEN_STAGES.filter((stage) => upgrade[stage].length > 0);
  if (activated && open.length) problems.push(`${file}: an activated upgrade cannot still list SIPs under ${open.join(", ")}`);
  return problems;
}

export function checkSections(sip, file) {
  const { header, sections, body } = sip;
  const problems = [];
  const missing = REQUIRED_SECTIONS.filter((title) => !sections.includes(title));
  if (missing.length) problems.push(`${file}: missing section${missing.length > 1 ? "s" : ""} ${missing.join(", ")}`);
  const needsTestCases = header.type === "Standards Track" && ["Core", "Market"].includes(header.category) && TEST_CASES_FROM.has(header.status);
  if (needsTestCases && !sections.includes("Test Cases")) problems.push(`${file}: a ${header.category} SIP needs Test Cases from Last Call on`);
  if (!/\bCC0\b/.test(body)) problems.push(`${file}: the Copyright section must waive rights under CC0`);
  return problems;
}

function describe(error) {
  const where = error.instancePath ? error.instancePath.slice(1).replaceAll("/", ".") : "header";
  if (error.keyword === "additionalProperties") return `${where} has an unknown field ${error.params.additionalProperty}`;
  if (error.keyword === "required") return `${where} is missing ${error.params.missingProperty}`;
  return `${where} ${error.message}`;
}
