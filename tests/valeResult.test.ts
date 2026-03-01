import { describe, it, expect } from "vitest";
import {
  valeOk,
  valeFail,
  valeSingleIssue,
  valeMergeResults,
} from "../src/valeResult";

describe("valeResult", () => {
  describe("valeOk", () => {
    it("returns ok result with value", () => {
      const r = valeOk(42);
      expect(r.ok).toBe(true);
      if (r.ok) expect(r.value).toBe(42);
    });
  });

  describe("valeFail", () => {
    it("returns fail result with issues", () => {
      const issues = [{ path: [], code: "x", message: "y" }];
      const r = valeFail(issues);
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.issues).toEqual(issues);
    });
  });

  describe("valeSingleIssue", () => {
    it("returns fail with single issue", () => {
      const r = valeSingleIssue(["a", 0], "code", "msg");
      expect(r.ok).toBe(false);
      if (!r.ok) {
        expect(r.issues).toHaveLength(1);
        expect(r.issues[0]).toEqual({ path: ["a", 0], code: "code", message: "msg" });
      }
    });
  });

  describe("valeMergeResults", () => {
    it("merges all ok results into object", () => {
      const r = valeMergeResults([
        { key: "a", res: valeOk(1) },
        { key: "b", res: valeOk("x") },
      ]);
      expect(r.ok).toBe(true);
      if (r.ok) {
        expect(r.value).toEqual({ a: 1, b: "x" });
      }
    });

    it("collects all issues when any result fails", () => {
      const r = valeMergeResults([
        { key: "a", res: valeOk(1) },
        { key: "b", res: valeFail([{ path: ["b"], code: "x", message: "y" }]) },
      ]);
      expect(r.ok).toBe(false);
      if (!r.ok) {
        expect(r.issues).toHaveLength(1);
        expect(r.issues[0].path).toEqual(["b"]);
      }
    });

    it("returns fail when multiple results fail", () => {
      const r = valeMergeResults([
        { key: "a", res: valeFail([{ path: ["a"], code: "1", message: "m1" }]) },
        { key: "b", res: valeFail([{ path: ["b"], code: "2", message: "m2" }]) },
      ]);
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.issues).toHaveLength(2);
    });
  });
});
