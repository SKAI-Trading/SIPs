import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { parseSip } from "./parse.mjs";
import { STAGES, checkHeader, checkSections } from "./rules.mjs";

const FILE_NAME = /^sip-(\d+)\.md$/;

export function loadTree(repoDir) {
  const dir = path.join(repoDir, "SIPS");
  if (!existsSync(dir)) return { sips: [], problems: [] };

  const sips = [];
  const problems = [];
  const present = new Set();
  for (const name of readdirSync(dir).filter((entry) => entry.endsWith(".md")).sort()) {
    const file = `SIPS/${name}`;
    const match = FILE_NAME.exec(name);
    if (!match) {
      problems.push(`${file}: a SIP file is named sip-<number>.md`);
      continue;
    }
    present.add(Number(match[1]));
    const sip = parseSip(readFileSync(path.join(dir, name), "utf8"), file);
    problems.push(...sip.problems);
    if (!sip.header) continue;
    const headerProblems = checkHeader(sip.header, file);
    problems.push(...headerProblems);
    if (headerProblems.length > 0) continue;
    problems.push(...checkSections(sip, file));
    if (sip.header.sip !== Number(match[1])) problems.push(`${file}: the header says sip ${sip.header.sip} but the file name says ${match[1]}`);
    sips.push(sip);
  }
  sips.sort((a, b) => a.header.sip - b.header.sip);
  return { sips, problems: [...problems, ...crossCheck(sips, present)] };
}

function crossCheck(sips, present) {
  const problems = [];
  const versions = new Map();
  for (const { header, file } of sips) {
    for (const number of header.requires ?? []) {
      if (!present.has(number)) problems.push(`${file}: requires SIP-${number}, which does not exist`);
    }
    if (!header.upgrade) continue;
    const { version } = header.upgrade;
    if (versions.has(version)) problems.push(`${file}: upgrade v${version} is already recorded by ${versions.get(version)}`);
    else versions.set(version, file);
    for (const stage of STAGES) {
      for (const number of header.upgrade[stage]) {
        if (number === header.sip) problems.push(`${file}: an upgrade cannot list its own SIP`);
        else if (!present.has(number)) problems.push(`${file}: lists SIP-${number} under ${stage}, which does not exist`);
      }
    }
  }
  return problems;
}
