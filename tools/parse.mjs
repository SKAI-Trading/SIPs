import { parse as parseYaml } from "yaml";

const HEADER = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)([\s\S]*)$/;
const SECTION = /^## (.+?)\s*#*\s*$/;
const FENCE = /^\s*(```|~~~)/;

export function parseSip(text, file) {
  const match = HEADER.exec(text);
  if (!match) return result(file, null, text, [`${file}: no header (the file must open with a --- block)`]);
  const body = match[2];
  let header;
  try {
    header = parseYaml(match[1]);
  } catch (error) {
    return result(file, null, body, [`${file}: the header is not valid YAML: ${error.message.split("\n")[0]}`]);
  }
  if (header === null || typeof header !== "object" || Array.isArray(header)) {
    return result(file, null, body, [`${file}: the header must be a mapping of fields`]);
  }
  return result(file, header, body, []);
}

function result(file, header, body, problems) {
  return { file, header, body, sections: sectionTitles(body), problems };
}

function sectionTitles(body) {
  const titles = [];
  let inFence = false;
  for (const line of body.split(/\r?\n/)) {
    if (FENCE.test(line)) inFence = !inFence;
    else if (!inFence) {
      const match = SECTION.exec(line);
      if (match) titles.push(match[1]);
    }
  }
  return titles;
}
