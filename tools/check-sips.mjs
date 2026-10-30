#!/usr/bin/env node
import { checkRepo } from "./check.mjs";
import { loadTree } from "./tree.mjs";

const args = process.argv.slice(2);
const treeOnly = args.includes("--tree-only");
const repoDir = args.find((arg) => !arg.startsWith("--")) ?? process.cwd();
const { SIP_PR_TITLE: title, SIP_PR_NUMBER: number, SIP_PR_BODY: body } = process.env;
const headMessage = title ? `${title}${number ? ` (#${number})` : ""}\n\n${body ?? ""}` : undefined;

const problems = checkRepo(repoDir, { treeOnly, headMessage });
for (const problem of problems) console.error(problem);
if (problems.length > 0) {
  console.error(`\n${problems.length} problem${problems.length === 1 ? "" : "s"}.`);
  process.exit(1);
}
const count = loadTree(repoDir).sips.length;
console.log(`${count} SIP${count === 1 ? " passes" : "s pass"} the ${treeOnly ? "tree check" : "tree and history checks"}.`);
