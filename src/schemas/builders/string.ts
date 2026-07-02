import { valeStringParser } from "../../parsers/string";
import {
  formatValidCnpj,
  formatValidCpf,
  formatValidCpfOrCnpj,
} from "../../patterns/cpfCnpj";
import type { ValePath } from "../../shared/types/common";
import type { ValeSchema, ValeSchemaMeta } from "../../shared/types/schema";
import type { ValeStringSchema } from "../types";
import { createCoercionSchema } from "./coercion";
import { chainStringFormat } from "./chainStringFormat";

const wrapStringSchema = <TOutput, TMeta extends ValeSchemaMeta>(
  inner: ValeSchema<TOutput, TMeta>,
  chain: (
    formatter: (value: string) => string | null,
    code: string,
    msg?: string,
  ) => ValeSchema<string, TMeta>,
): ValeStringSchema<TOutput, TMeta> => ({
  resolve: (input: unknown, path?: ValePath) => inner.resolve(input, path),
  probe: (input: unknown, path?: ValePath) => inner.probe(input, path),
  optional: () =>
    wrapStringSchema(inner.optional(), chain) as ValeStringSchema<
      TOutput | undefined,
      TMeta & { optional: true }
    >,
  nullable: () =>
    wrapStringSchema(inner.nullable(), chain) as ValeStringSchema<
      TOutput | null,
      TMeta & { nullable: true }
    >,
  nullish: () =>
    wrapStringSchema(inner.nullish(), chain) as ValeStringSchema<
      TOutput | null | undefined,
      TMeta & { nullish: true }
    >,
  default: (value) =>
    wrapStringSchema(inner.default(value), chain) as ValeStringSchema<
      Exclude<TOutput, null | undefined>,
      TMeta & { default: true }
    >,
  into: (fn) => inner.into(fn),
  guard: (guard, message) =>
    wrapStringSchema(inner.guard(guard, message), chain) as ValeStringSchema<
      TOutput,
      TMeta
    >,
  lock: () =>
    wrapStringSchema(inner.lock(), chain) as ValeStringSchema<
      TOutput,
      TMeta & { locked: true }
    >,
  cpf: (msg) =>
    chain(formatValidCpf, "cpf", msg) as ValeStringSchema<string, TMeta>,
  cnpj: (msg) =>
    chain(formatValidCnpj, "cnpj", msg) as ValeStringSchema<string, TMeta>,
  cpfCnpj: (msg) =>
    chain(formatValidCpfOrCnpj, "cpfCnpj", msg) as ValeStringSchema<
      string,
      TMeta
    >,
});

export const createStringSchema = (message?: string): ValeStringSchema => {
  const inner = createCoercionSchema("string", valeStringParser, message);

  const chain = (
    formatter: (value: string) => string | null,
    code: string,
    msg?: string,
  ) => chainStringFormat(inner, formatter, code, msg);

  return wrapStringSchema(inner, chain);
};
