// plane imports
import { EQUALITY_OPERATOR, TFilterProperty } from "@plane/types";
// local imports
import { getTextConfig } from "../extended";
import { createFilterConfig, createOperatorConfigEntry, TCreateFilterConfig } from "../shared";
import { TCustomPropertyFilterParams } from "./shared";

/**
 * Text property filter specific params
 */
type TCreateTextPropertyFilterParams = TCustomPropertyFilterParams<string> & {
  minLength?: number;
  maxLength?: number;
};

/**
 * Get the text property filter config
 * @param params - The filter params
 * @returns The text property filter config
 */
export const getTextPropertyFilterConfig =
  <P extends TFilterProperty>(key: P): TCreateFilterConfig<P, TCreateTextPropertyFilterParams> =>
  (params: TCreateTextPropertyFilterParams) =>
    createFilterConfig({
      id: key,
      ...params,
      label: params.propertyDisplayName,
      icon: params.filterIcon,
      supportedOperatorConfigsMap: new Map([
        createOperatorConfigEntry(EQUALITY_OPERATOR.EXACT, params, (updatedParams) => getTextConfig(updatedParams)),
        createOperatorConfigEntry(EQUALITY_OPERATOR.CONTAINS, params, (updatedParams) => getTextConfig(updatedParams)),
      ]),
    });
