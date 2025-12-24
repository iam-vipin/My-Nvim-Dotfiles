// plane imports
import { EQUALITY_OPERATOR } from "@plane/types";
// local imports
import { getWithValueConfig } from "../extended";
import type { TCreateFilterConfigParams } from "../shared";
import { createOperatorConfigEntry } from "../shared";

/**
 * Helper to get the ISNULL operator config entry
 * @param params - The filter params
 * @returns The ISNULL operator config entry
 */
export const getIsNullOperatorConfigEntry = <P extends TCreateFilterConfigParams>(params: P) =>
  createOperatorConfigEntry(EQUALITY_OPERATOR.ISNULL, params, (updatedParams) =>
    getWithValueConfig({
      ...updatedParams,
      value: true, // always true for ISNULL operator
      allowNegative: false, // ISNULL operator does not support negation for now
    })
  );
