import { describe, expect, it } from "vitest";
import { checkMove, checkStart } from "../moves.mjs";
import { header, upgradeHeader } from "../testing.mjs";

const at = (status, extra = {}) => header({ status, ...extra });

describe("checkMove", () => {
  it("allows the moves in SIP-1 and refuses the rest", () => {
    expect(checkMove(at("Draft"), at("Review"), "2026-11-10")).toBeNull();
    expect(checkMove(at("Review"), at("Draft"), "2026-11-10")).toBeNull();
    expect(checkMove(at("Stagnant"), at("Review"), "2026-11-10")).toBeNull();
    expect(checkMove(at("Draft"), at("Final"), "2026-11-10")).toBe("Draft cannot move to Final");
    expect(checkMove(at("Final"), at("Review"), "2026-11-10")).toBe("Final cannot move to Review");
    expect(checkMove(at("Withdrawn"), at("Draft"), "2026-11-10")).toBe("Withdrawn cannot move to Draft");
  });

  it("needs a Final Review deadline at least 14 days out", () => {
    expect(checkMove(at("Review"), at("Final Review", { "final-review-deadline": "2026-11-24" }), "2026-11-10")).toBeNull();
    expect(checkMove(at("Review"), at("Final Review", { "final-review-deadline": "2026-11-23" }), "2026-11-10")).toBe("Final Review needs a deadline at least 14 days after 2026-11-10");
  });

  it("allows Final only after the deadline", () => {
    const finalReview = at("Final Review", { "final-review-deadline": "2026-11-24" });
    expect(checkMove(finalReview, at("Final"), "2026-11-24")).toBe("Final before the Final Review deadline 2026-11-24");
    expect(checkMove(finalReview, at("Final"), "2026-11-25")).toBeNull();
  });

  it("ignores a commit that leaves the status alone", () => {
    expect(checkMove(at("Review"), at("Review"), "2026-11-10")).toBeNull();
  });
});

describe("checkStart", () => {
  it("starts a SIP as Draft", () => {
    expect(checkStart(at("Draft"))).toBeNull();
    expect(checkStart(at("Review"))).toBe("a new SIP starts as Draft, not Review");
  });

  it("lets a Meta process SIP start as Living and an upgrade record start as Final", () => {
    expect(checkStart(header({ status: "Living", type: "Meta", category: undefined }))).toBeNull();
    expect(checkStart(upgradeHeader({ status: "Final" }))).toBeNull();
    expect(checkStart(header({ status: "Final", type: "Meta", category: undefined }))).toBe("a new SIP starts as Draft, not Final");
  });
});
