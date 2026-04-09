import { valeStringParser } from "../../parsers/string";
import {
  formatValidCnpj,
  formatValidCpf,
  formatValidCpfOrCnpj,
} from "../../patterns/cpfCnpj";
import type { ValeStringSchema } from "../types";
import type { ValePath } from "../../shared/types/common";
import { createCoercionSchema } from "./coercion";
import { chainStringFormat } from "./chainStringFormat";

export const createStringSchema = (message?: string): ValeStringSchema => {
  const inner = createCoercionSchema("string", valeStringParser, message);

  const chain = (
    formatter: (value: string) => string | null,
    code: string,
    msg?: string,
  ) => chainStringFormat(inner, formatter, code, msg);

  return {
    resolve: (input: unknown, path?: ValePath) =>
      inner.resolve(input, path),
    probe: (input: unknown, path?: ValePath) => inner.probe(input, path),
    optional: () => inner.optional(),
    nullable: () => inner.nullable(),
    nullish: () => inner.nullish(),
    default: (value) => inner.default(value),
    into: (fn) => inner.into(fn),
    guard: (g, msg) => inner.guard(g, msg),
    lock: () => inner.lock(),
    cpf: (msg) => chain(formatValidCpf, "cpf", msg),
    cnpj: (msg) => chain(formatValidCnpj, "cnpj", msg),
    cpfCnpj: (msg) => chain(formatValidCpfOrCnpj, "cpfCnpj", msg),
  };
};
