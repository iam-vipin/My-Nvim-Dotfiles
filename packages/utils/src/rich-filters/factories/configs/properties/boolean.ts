// plane imports
import { EQUALITY_OPERATOR, TFilterProperty } from "@plane/types";
// local imports
import { getBooleanConfig } from "../extended";
import { createFilterConfig, createOperatorConfigEntry, TCreateFilterConfig } from "../shared";
import { TCustomPropertyFilterParams } from "./shared";

/**
 * Boolean property filter specific params
 */
export type TCreateBooleanPropertyFilterParams = TCustomPropertyFilterParams<boolean> & {
  defaultValue?: boolean;
};

/**
 * Get the boolean property filter config
 * @param params - The filter params
 * @returns The boolean property filter config
 */
export const getBooleanPropertyFilterConfig =
  <P extends TFilterProperty>(key: P): TCreateFilterConfig<P, TCreateBooleanPropertyFilterParams> =>
  (params: TCreateBooleanPropertyFilterParams) =>
    createFilterConfig({
      id: key,
      ...params,
      label: params.propertyDisplayName,
      icon: params.filterIcon,
      supportedOperatorConfigsMap: new Map([
        createOperatorConfigEntry(EQUALITY_OPERATOR.EXACT, params, (updatedParams) => getBooleanConfig(updatedParams)),
      ]),
    });
