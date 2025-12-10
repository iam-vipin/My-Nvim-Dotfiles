// plane imports
import type { IMilestoneInstance, TFilterProperty, TMilestone, TSupportedOperators } from "@plane/types";
import { EQUALITY_OPERATOR, COLLECTION_OPERATOR } from "@plane/types";
// local imports
import type { TCreateFilterConfigParams, IFilterIconConfig, TCreateFilterConfig } from "../../../rich-filters";
import { createFilterConfig, getMultiSelectConfig, createOperatorConfigEntry } from "../../../rich-filters";

/**
 * Work item type filter specific params
 */
export type TCreateMilestoneFilterParams = TCreateFilterConfigParams &
  IFilterIconConfig<IMilestoneInstance> & {
    milestones: IMilestoneInstance[];
  };

/**
 * Helper to get the work item type multi select config
 * @param params - The filter params
 * @returns The work item type multi select config
 */
export const getMilestoneMultiSelectConfig = (
  params: TCreateMilestoneFilterParams,
  singleValueOperator: TSupportedOperators
) =>
  getMultiSelectConfig<IMilestoneInstance, string, IMilestoneInstance>(
    {
      items: params.milestones.filter(Boolean).filter((milestone) => milestone.id && milestone.title),
      getId: (milestone) => milestone.id,
      getLabel: (milestone) => milestone.title,
      getValue: (milestone) => milestone.id,
      getIconData: (milestone) => milestone,
    },
    {
      singleValueOperator,
      ...params,
    },
    {
      ...params,
    }
  );

/**
 * Get the work item type filter config
 * @template K - The filter key
 * @param key - The filter key to use
 * @returns A function that takes parameters and returns the work item type filter config
 */
export const getMilestoneFilterConfig =
  <P extends TFilterProperty>(key: P): TCreateFilterConfig<P, TCreateMilestoneFilterParams> =>
  (params: TCreateMilestoneFilterParams) =>
    createFilterConfig<P, string>({
      id: key,
      label: "Milestone",
      ...params,
      icon: params.filterIcon,
      supportedOperatorConfigsMap: new Map([
        createOperatorConfigEntry(COLLECTION_OPERATOR.IN, params, (updatedParams) =>
          getMilestoneMultiSelectConfig(updatedParams, EQUALITY_OPERATOR.EXACT)
        ),
      ]),
    });
