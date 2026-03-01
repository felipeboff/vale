import type { ValeIssue } from "./valeTypes";

export class ValeError extends Error {
  constructor(public issues: ValeIssue[]) {
    super("ValeError");
  }
}
