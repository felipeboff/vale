import type { ValeIssue } from "../../shared/types/common";

export class ValeError extends Error {
  constructor(public issues: ValeIssue[]) {
    super("ValeError");
    this.name = "ValeError";
  }
}
