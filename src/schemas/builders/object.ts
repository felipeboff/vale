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

    const shapeKeys = Object.keys(shape) as Array<keyof T & string>;
    const entries = shapeKeys.map((key) => ({
      key,
      res: shape[key].probe(input[key], [...path, key]),
    }));

    return valeMergeResults(entries) as ValeResult<ValeObjectOutput<T>>;
  });
