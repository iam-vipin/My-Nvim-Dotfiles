// plane imports
import type { IUserLite, TInitiativeStates, TFilterProperty, TInitiativeLabel } from "@plane/types";
import { COLLECTION_OPERATOR, EQUALITY_OPERATOR } from "@plane/types";
// local imports
import type { TCreateFilterConfigParams, IFilterIconConfig, TCreateDateFilterParams } from "../../rich-filters";
import {
  createFilterConfig,
  createOperatorConfigEntry,
  getMultiSelectConfig,
  getMemberMultiSelectConfig,
  getSupportedDateOperators,
} from "../../rich-filters";

// ------------ Initiative filter types ------------

export type TCreateInitiativeLeadFilterParams = TCreateFilterConfigParams &
  IFilterIconConfig<IUserLite> & {
    members: IUserLite[];
  };

export type TCreateInitiativeStatesFilterParams = TCreateFilterConfigParams &
  IFilterIconConfig<TInitiativeStates> & {
    items: Array<{ key: TInitiativeStates; title: string; icon: React.FC<React.SVGAttributes<SVGElement>> }>;
  };

export type TCreateInitiativeLabelsFilterParams = TCreateFilterConfigParams &
  IFilterIconConfig<string> & {
    labels: TInitiativeLabel[];
  };

// ------------ Lead filter ------------

/**
 * Get the lead filter config for initiatives
 * @template K - The filter key
 * @param key - The filter key to use
 * @returns A function that takes parameters and returns the lead filter config
 */
export const getInitiativeLeadFilterConfig =
  <P extends string>(key: P) =>
  (params: TCreateInitiativeLeadFilterParams) =>
    createFilterConfig<P, string>({
      id: key,
      label: "Lead",
      icon: params.filterIcon,
      isEnabled: params.isEnabled,
      supportedOperatorConfigsMap: new Map([
        createOperatorConfigEntry(COLLECTION_OPERATOR.IN, params, (updatedParams) =>
          getMemberMultiSelectConfig(updatedParams, EQUALITY_OPERATOR.EXACT)
        ),
      ]),
    });

// ------------ States filter ------------

/**
 * Get the states filter config for initiatives
 * @template K - The filter key
 * @param key - The filter key to use
 * @returns A function that takes parameters and returns the states filter config
 */
export const getInitiativeStatesFilterConfig =
  <P extends string>(key: P) =>
  (params: TCreateInitiativeStatesFilterParams) =>
    createFilterConfig<P, TInitiativeStates>({
      id: key,
      label: "State",
      icon: params.filterIcon,
      isEnabled: params.isEnabled,
      supportedOperatorConfigsMap: new Map([
        createOperatorConfigEntry(COLLECTION_OPERATOR.IN, params, (updatedParams) =>
          getMultiSelectConfig<
            { key: TInitiativeStates; title: string; icon: React.FC<React.SVGAttributes<SVGElement>> },
            TInitiativeStates,
            TInitiativeStates
          >(
            {
              items: params.items,
              getId: (state) => state.key,
              getLabel: (state) => state.title,
              getValue: (state) => state.key,
              getIconData: (state) => state.key,
            },
            {
              singleValueOperator: EQUALITY_OPERATOR.EXACT,
              ...updatedParams,
            },
            {
              ...updatedParams,
            }
          )
        ),
      ]),
    });

// ------------ Labels filter ------------

/**
 * Get the labels filter config for initiatives
 * @template K - The filter key
 * @param key - The filter key to use
 * @returns A function that takes parameters and returns the labels filter config
 */
export const getInitiativeLabelsFilterConfig =
  <P extends string>(key: P) =>
  (params: TCreateInitiativeLabelsFilterParams) =>
    createFilterConfig<P, string>({
      id: key,
      label: "Labels",
      icon: params.filterIcon,
      isEnabled: params.isEnabled,
      supportedOperatorConfigsMap: new Map([
        createOperatorConfigEntry(COLLECTION_OPERATOR.IN, params, (updatedParams) =>
          getMultiSelectConfig<TInitiativeLabel, string, string>(
            {
              items: params.labels,
              getId: (label) => label.id,
              getLabel: (label) => label.name,
              getValue: (label) => label.id,
              getIconData: (label) => label.color,
            },
            {
              singleValueOperator: EQUALITY_OPERATOR.EXACT,
              ...updatedParams,
            },
            {
              getOptionIcon: params.getOptionIcon,
            }
          )
        ),
      ]),
    });

// ------------ Date filters ------------

/**
 * Get the start date filter config for initiatives
 * @template K - The filter key
 * @param key - The filter key to use
 * @returns A function that takes parameters and returns the start date filter config
 */
export const getInitiativeStartDateFilterConfig =
  <P extends TFilterProperty>(key: P) =>
  (params: TCreateDateFilterParams) =>
    createFilterConfig<P, Date>({
      id: key,
      label: "Start date",
      icon: params.filterIcon,
      isEnabled: params.isEnabled,
      allowMultipleFilters: true,
      supportedOperatorConfigsMap: getSupportedDateOperators(params),
    });

/**
 * Get the end date filter config for initiatives
 * @template K - The filter key
 * @param key - The filter key to use
 * @returns A function that takes parameters and returns the end date filter config
 */
export const getInitiativeEndDateFilterConfig =
  <P extends TFilterProperty>(key: P) =>
  (params: TCreateDateFilterParams) =>
    createFilterConfig<P, Date>({
      id: key,
      label: "End date",
      icon: params.filterIcon,
      isEnabled: params.isEnabled,
      allowMultipleFilters: true,
      supportedOperatorConfigsMap: getSupportedDateOperators(params),
    });
