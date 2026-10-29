import type { ExecFileSyncOptions } from "node:child_process";

export type Status = "Draft" | "Review" | "Last Call" | "Final" | "Stagnant" | "Withdrawn" | "Living";
export type SipType = "Standards Track" | "Meta" | "Informational";
export type Category = "Core" | "Market" | "Interface" | "Contract";
export type Audience = "traders" | "market-makers" | "validators" | "app-developers" | "wallets" | "players" | "holders";
export type Stage = "proposed" | "considered" | "scheduled" | "declined" | "included";

export interface Upgrade {
  version: number;
  proposed: number[];
  considered: number[];
  scheduled: number[];
  declined: number[];
  included: number[];
  rollout: { date: string | null };
  activation: { height: number | null; date: string | null };
}

export interface SipHeader {
  sip: number;
  title: string;
  description: string;
  author: string;
  "discussions-to": string;
  status: Status;
  type: SipType;
  category?: Category;
  created: string;
  requires?: number[];
  "last-call-deadline"?: string;
  "withdrawal-reason"?: string;
  "governance-tier"?: 1 | 2 | 3;
  summary: string;
  impact?: Partial<Record<Audience, string>>;
  upgrade?: Upgrade;
}

export interface ParsedSip {
  file: string;
  header: SipHeader | null;
  body: string;
  sections: string[];
  problems: string[];
}

export type CheckedSip = ParsedSip & { header: SipHeader };

export interface Commit {
  sha: string;
  date: string;
  subject: string;
  pr: number | null;
  forum: string | null;
  changes: { status: string; file: string }[];
}

export type HistoryEvent =
  | { kind: "created"; sip: number; status: Status; header: SipHeader; commit: Commit }
  | { kind: "status"; sip: number; from: Status; to: Status; before: SipHeader; after: SipHeader; commit: Commit }
  | { kind: "stage"; sip: number; upgrade: number; upgradeSip: number; from: Stage | null; to: Stage | null; initial: boolean; commit: Commit }
  | { kind: "rollout"; sip: number; upgrade: number; date: string | null; initial: boolean; commit: Commit }
  | { kind: "activation"; sip: number; upgrade: number; height: number | null; date: string | null; initial: boolean; commit: Commit }
  | { kind: "deleted"; sip: number; commit: Commit };

export const AUDIENCES: readonly Audience[];
export const STAGES: readonly Stage[];
export const REQUIRED_SECTIONS: readonly string[];
export function parseSip(text: string, file: string): ParsedSip;
export function checkHeader(header: unknown, file: string): string[];
export function checkSections(sip: CheckedSip, file: string): string[];
export function loadTree(repoDir: string): { sips: CheckedSip[]; problems: string[] };
export function gitBinary(env?: NodeJS.ProcessEnv): string;
export function git(repoDir: string, args: string[], options?: ExecFileSyncOptions): string;
export function checkMove(before: SipHeader, after: SipHeader, date: string): string | null;
export function checkStart(header: SipHeader): string | null;
export function isShallow(repoDir: string): boolean;
export function readHistory(repoDir: string, options?: { headMessage?: string }): { commits: Commit[]; events: HistoryEvent[] };
export function historyProblems(events: HistoryEvent[], exceptions?: Record<string, string>): string[];
export function checkRepo(repoDir: string, options?: { treeOnly?: boolean; headMessage?: string }): string[];
