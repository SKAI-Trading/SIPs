import type { SipHeader, Upgrade } from "./index.js";

export const FULL_BODY: string;
export function header(overrides?: Record<string, unknown>): SipHeader;
export function upgradeHeader(overrides?: Record<string, unknown>, upgrade?: Partial<Upgrade>): SipHeader;
export function fullImpact(text?: string): Record<string, string>;
export function sipText(fields: Record<string, unknown>, body?: string): string;
export interface FixtureCommit {
  files?: Record<string, string | null>;
  message: string;
  date: string;
}
export function makeRepo(commits: FixtureCommit[]): string;
export function addCommit(dir: string, commit: FixtureCommit): void;
