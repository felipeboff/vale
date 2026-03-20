import { describe, it, expect } from "vitest";
import {
  valeOk,
  valeFail,
  valeSingleIssue,
  valeMergeResults,
} from "./helpers";

describe("valeResult", () => {
  describe("valeOk", () => {
    it("returns ok result with value", () => {
      const result = valeOk(42);
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.value).toBe(42);
    });
  });

  describe("valeFail", () => {
    it("returns fail result with issues", () => {
      const issues = [{ path: [], code: "x", message: "y" }];
      const result = valeFail(issues);
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.issues).toEqual(issues);
    });
  });

  describe("valeSingleIssue", () => {
    it("returns fail with single issue", () => {
      const result = valeSingleIssue(["a", 0], "code", "msg");
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.issues).toHaveLength(1);
        expect(result.issues[0]).toEqual({
          path: ["a", 0],
          code: "code",
          message: "msg",
        });
      }
    });
  });

  describe("valeMergeResults", () => {
    it("merges all ok results into object", () => {
      const result = valeMergeResults([
        { key: "a", res: valeOk(1) },
        { key: "b", res: valeOk("x") },
      ]);

      expect(result.ok).toBe(true);
      if (result.ok) expect(result.value).toEqual({ a: 1, b: "x" });
    });

    it("collects all issues when any result fails", () => {
      const result = valeMergeResults([
        { key: "a", res: valeOk(1) },
        {
          key: "b",
          res: valeFail([{ path: ["b"], code: "x", message: "y" }]),
        },
      ]);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.issues).toHaveLength(1);
        expect(result.issues[0].path).toEqual(["b"]);
      }
    });

    it("returns fail when multiple results fail", () => {
      const result = valeMergeResults([
        {
          key: "a",
          res: valeFail([{ path: ["a"], code: "1", message: "m1" }]),
        },
        {
          key: "b",
          res: valeFail([{ path: ["b"], code: "2", message: "m2" }]),
        },
      ]);

      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.issues).toHaveLength(2);
    });
  });
});
