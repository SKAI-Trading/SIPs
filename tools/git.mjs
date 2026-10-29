import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";

let resolved = null;

// A bare "git" lets Windows run a git.exe sitting in the working folder ahead
// of the real one (recurring-issues §478), so the binary is found on PATH,
// skipping relative entries, and spawned by its absolute path.
export function gitBinary(env = process.env) {
  if (env === process.env && resolved) return resolved;
  const name = process.platform === "win32" ? "git.exe" : "git";
  for (const dir of (env.PATH ?? env.Path ?? "").split(path.delimiter)) {
    if (!dir || !path.isAbsolute(dir)) continue;
    const candidate = path.join(dir, name);
    if (existsSync(candidate)) {
      if (env === process.env) resolved = candidate;
      return candidate;
    }
  }
  throw new Error(`${name} is not on PATH`);
}

export function git(repoDir, args, options = {}) {
  return execFileSync(gitBinary(), ["-C", repoDir, ...args], {
    encoding: "utf8",
    maxBuffer: 256 * 1024 * 1024,
    stdio: ["ignore", "pipe", "pipe"],
    ...options,
  });
}
