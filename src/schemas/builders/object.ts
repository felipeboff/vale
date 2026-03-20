import { makeVale } from "../../core/schema/makeVale";
import { valeMergeResults, valeSingleIssue } from "../../core/result/helpers";
import { valeIsRecord } from "../../shared/guards/valeIsRecord";
import type { ValeResult } from "../../shared/types/common";
import type {
  ValeObjectOutput,
  ValeSchema,
  ValeShape,
} from "../../shared/types/schema";
import { defaultMessage } from "../utils/defaultMessage";

export const createObjectSchema = <T extends ValeShape>(
  shape: T,
): ValeSchema<ValeObjectOutput<T>> =>
  makeVale<ValeObjectOutput<T>>((input, path) => {
    if (!valeIsRecord(input)) {
      return valeSingleIssue(path, "object", defaultMessage(path, "object"));
    }

    const entries = Object.keys(shape).map((key) => {
      const schema = shape[key as keyof T];
      const result = schema.probe(input[key], [...path, key]);

      return {
        key: key as keyof ValeObjectOutput<T>,
        res: result as ValeResult<unknown>,
      };
    });

    return valeMergeResults<ValeObjectOutput<T>>(entries);
  });
