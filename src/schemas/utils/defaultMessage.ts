import type { ValePath } from "../../shared/types/common";

export const defaultMessage = (path: ValePath, code: string): string =>
  path.length
    ? `${String(path[path.length - 1])} is invalid ${code}`
    : `Invalid ${code}`;
