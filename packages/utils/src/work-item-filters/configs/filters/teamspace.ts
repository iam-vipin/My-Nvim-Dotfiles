// plane imports
import type { TFilterProperty } from "@plane/types";
import { EQUALITY_OPERATOR, COLLECTION_OPERATOR } from "@plane/types";
// local imports
import type { TCreateFilterConfig, TCreateProjectFilterParams } from "../../../rich-filters";
import { createFilterConfig, createOperatorConfigEntry, getProjectMultiSelectConfig } from "../../../rich-filters";

/**
 * Teamspace Project filter specific params
 */
export type TCreateTeamspaceProjectFilterParams = TCreateProjectFilterParams;

/**
 * Get the teamspace project filter config
 * @template K - The filter key
 * @param key - The filter key to use
 * @returns A function that takes parameters and returns the teamspace project filter config
 */
export const getTeamspaceProjectFilterConfig =
  <P extends TFilterProperty>(key: P): TCreateFilterConfig<P, TCreateTeamspaceProjectFilterParams> =>
  (params: TCreateTeamspaceProjectFilterParams) =>
    createFilterConfig<P>({
      id: key,
      label: "Teamspace Projects",
      ...params,
      icon: params.filterIcon,
      supportedOperatorConfigsMap: new Map([
        createOperatorConfigEntry(COLLECTION_OPERATOR.IN, params, (updatedParams) =>
          getProjectMultiSelectConfig(updatedParams, EQUALITY_OPERATOR.EXACT)
        ),
      ]),
    });
