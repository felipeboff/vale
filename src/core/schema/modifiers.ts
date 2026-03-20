import { ValeError } from "../errors/ValeError";
import { valeSingleIssue } from "../result/helpers";
import { applyLockValidation } from "./lock";
import type {
  ValeNonNullish,
  ValePath,
  ValeResult,
} from "../../shared/types/common";

type Probe<T> = (input: unknown, path?: ValePath) => ValeResult<T>;
type Parser<T> = (input: unknown, path: ValePath) => ValeResult<T>;

export const isUndefinedLike = (input: unknown): input is undefined | "" =>
  input === undefined || input === "";

export const isNullLike = (input: unknown): input is null | "null" =>
  input === null || input === "null";

const isDefaultLike = (
  input: unknown,
): input is undefined | null | "" | "null" =>
  isUndefinedLike(input) || isNullLike(input);

export const parseOrThrow =
  <T>(probe: Probe<T>): ((input: unknown, path?: ValePath) => T) =>
  (input: unknown, path: ValePath = []): T => {
    const result = probe(input, path);
    if (result.ok) return result.value;
    throw new ValeError(result.issues);
  };

export const createOptionalParser =
  <T>(probe: Probe<T>): Parser<T | undefined> =>
  (input, path) => {
    if (isUndefinedLike(input)) return { ok: true, value: undefined };
    return probe(input, path);
  };

export const createNullableParser =
  <T>(probe: Probe<T>): Parser<T | null> =>
  (input, path) => {
    if (isNullLike(input)) return { ok: true, value: null };
    return probe(input, path);
  };

export const createNullishParser =
  <T>(probe: Probe<T>): Parser<T | null | undefined> =>
  (input, path) => {
    if (isUndefinedLike(input)) return { ok: true, value: undefined };
    if (isNullLike(input)) return { ok: true, value: null };
    return probe(input, path);
  };

export const createDefaultParser =
  <T>(
    probe: Probe<T>,
    fallback: ValeNonNullish<T>,
  ): Parser<ValeNonNullish<T>> =>
  (input, path) => {
    if (isDefaultLike(input)) return { ok: true, value: fallback };
    return probe(input, path) as ValeResult<ValeNonNullish<T>>;
  };

export const createIntoParser =
  <T, U>(probe: Probe<T>, fn: (value: T) => U): Parser<U> =>
  (input, path) => {
    const result = probe(input, path);
    return result.ok ? { ok: true, value: fn(result.value) } : result;
  };

export const createGuardParser =
  <T>(
    probe: Probe<T>,
    guard: (value: T) => boolean,
    message: string,
  ): Parser<T> =>
  (input, path) => {
    const result = probe(input, path);
    if (!result.ok) return result;
    return guard(result.value)
      ? result
      : valeSingleIssue(path, "refine", message);
  };

export const createLockParser =
  <T>(probe: Probe<T>): Parser<T> =>
  (input, path) =>
    applyLockValidation(input, probe(input, path), path);
