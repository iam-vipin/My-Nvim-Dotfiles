// plane imports
import { COMPARISON_OPERATOR, EQUALITY_OPERATOR, TFilterProperty } from "@plane/types";
// local imports
import { getNumberConfig, getNumberRangeConfig } from "../extended";
import { createFilterConfig, createOperatorConfigEntry, TCreateFilterConfig } from "../shared";
import { TCustomPropertyFilterParams } from "./shared";

/**
 * Number property filter specific params
 */
export type TCreateNumberPropertyFilterParams = TCustomPropertyFilterParams<number> & {
  min?: number;
  max?: number;
};

/**
 * Get the number property filter config
 * @param params - The filter params
 * @returns The number property filter config
 */
export const getNumberPropertyFilterConfig =
  <P extends TFilterProperty>(key: P): TCreateFilterConfig<P, TCreateNumberPropertyFilterParams> =>
  (params: TCreateNumberPropertyFilterParams) =>
    createFilterConfig({
      id: key,
      ...params,
      label: params.propertyDisplayName,
      icon: params.filterIcon,
      supportedOperatorConfigsMap: new Map([
        createOperatorConfigEntry(EQUALITY_OPERATOR.EXACT, params, (updatedParams) => getNumberConfig(updatedParams)),
        createOperatorConfigEntry(COMPARISON_OPERATOR.LESS_THAN, params, (updatedParams) =>
          getNumberConfig(updatedParams)
        ),
        createOperatorConfigEntry(COMPARISON_OPERATOR.LESS_THAN_OR_EQUAL_TO, params, (updatedParams) =>
          getNumberConfig(updatedParams)
        ),
        createOperatorConfigEntry(COMPARISON_OPERATOR.GREATER_THAN, params, (updatedParams) =>
          getNumberConfig(updatedParams)
        ),
        createOperatorConfigEntry(COMPARISON_OPERATOR.GREATER_THAN_OR_EQUAL_TO, params, (updatedParams) =>
          getNumberConfig(updatedParams)
        ),
        createOperatorConfigEntry(COMPARISON_OPERATOR.RANGE, params, (updatedParams) =>
          getNumberRangeConfig(updatedParams)
        ),
      ]),
    });
