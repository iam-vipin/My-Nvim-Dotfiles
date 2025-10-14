// plane imports
import {
  COLLECTION_OPERATOR,
  EQUALITY_OPERATOR,
  TFilterProperty,
  TIssuePropertyOption,
  TSupportedOperators,
} from "@plane/types";
// local imports
import { getMultiSelectConfig } from "../core";
import { createFilterConfig, createOperatorConfigEntry, TCreateFilterConfig } from "../shared";
import { TCustomPropertyFilterParams } from "./shared";

/**
 * Dropdown property filter specific params
 */
type TCreateDropdownPropertyFilterParams = TCustomPropertyFilterParams<TIssuePropertyOption> & {
  customPropertyOptions: TIssuePropertyOption[];
};

/**
 * Helper to get the dropdown multi select config
 * @param params - The filter params
 * @returns The dropdown multi select config
 */
export const getDropdownMultiSelectConfig = (
  params: TCreateDropdownPropertyFilterParams,
  singleValueOperator: TSupportedOperators
) =>
  getMultiSelectConfig<TIssuePropertyOption, string, TIssuePropertyOption>(
    {
      items: params.customPropertyOptions,
      getId: (option) => option.id!,
      getLabel: (option) => option.name!,
      getValue: (option) => option.id!,
      getIconData: (option) => option,
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
 * Get the dropdown property filter config
 * @param params - The filter params
 * @returns The dropdown property filter config
 */
export const getDropdownPropertyFilterConfig =
  <P extends TFilterProperty>(key: P): TCreateFilterConfig<P, TCreateDropdownPropertyFilterParams> =>
  (params: TCreateDropdownPropertyFilterParams) =>
    createFilterConfig({
      id: key,
      ...params,
      label: params.propertyDisplayName,
      icon: params.filterIcon,
      supportedOperatorConfigsMap: new Map([
        createOperatorConfigEntry(COLLECTION_OPERATOR.IN, params, (updatedParams) =>
          getDropdownMultiSelectConfig(updatedParams, EQUALITY_OPERATOR.EXACT)
        ),
      ]),
    });
