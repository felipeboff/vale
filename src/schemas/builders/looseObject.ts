import { makeVale } from "../../core/schema/makeVale";
import { valeOk, valeSingleIssue } from "../../core/result/helpers";
import { valeIsRecord } from "../../shared/guards/valeIsRecord";
import type { ValeResult } from "../../shared/types/common";
import type {
  ValeLooseObjectOutput,
  ValeObjectOutput,
  ValeSchema,
  ValeShape,
} from "../../shared/types/schema";
import { defaultMessage } from "../utils/defaultMessage";
import { createObjectSchema } from "./object";

export const createPassthroughSchema = (): ValeSchema<Record<string, unknown>> =>
  makeVale<Record<string, unknown>>((input, path) => {
    if (!valeIsRecord(input)) {
      return valeSingleIssue(path, "object", defaultMessage(path, "object"));
    }

    return valeOk({ ...input });
  });

export const createLooseObjectSchema = <T extends ValeShape>(
  shape: T,
): ValeSchema<ValeLooseObjectOutput<T>> => {
  const knownSchema = createObjectSchema(shape);

  return makeVale<ValeLooseObjectOutput<T>>((input, path) => {
    if (!valeIsRecord(input)) {
      return valeSingleIssue(path, "object", defaultMessage(path, "object"));
    }

    const knownResult = knownSchema.probe(input, path) as ValeResult<
      ValeObjectOutput<T>
    >;

    if (!knownResult.ok) {
      return knownResult;
    }

    return valeOk({ ...input, ...knownResult.value });
  });
};

export const createStrictObjectSchema = <T extends ValeShape>(
  shape: T,
): ValeSchema<ValeObjectOutput<T>> => createObjectSchema(shape).lock();
