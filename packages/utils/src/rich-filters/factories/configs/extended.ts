/**
 * SPDX-FileCopyrightText: 2023-present Plane Software, Inc.
 * SPDX-License-Identifier: LicenseRef-Plane-Commercial
 *
 * Licensed under the Plane Commercial License (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * https://plane.so/legals/eula
 *
 * DO NOT remove or modify this notice.
 * NOTICE: Proprietary and confidential. Unauthorized use or distribution is prohibited.
 */

// plane imports
import type { TFilterValue } from "@plane/types";
import { EXTENDED_FILTER_FIELD_TYPE } from "@plane/types";
// local imports
import type { TCreateFilterConfigParams } from "./shared";
import { createFilterFieldConfig } from "./shared";

// ------------ Boolean filters ------------

/**
 * Boolean filter configuration
 */
export type TBooleanConfig = TCreateFilterConfigParams;

/**
 * Helper to get the boolean filter config with True/False options
 * @param config - Boolean-specific configuration
 * @returns The boolean filter config
 */
export const getBooleanConfig = (config: TBooleanConfig) =>
  createFilterFieldConfig<typeof EXTENDED_FILTER_FIELD_TYPE.BOOLEAN, boolean>({
    type: EXTENDED_FILTER_FIELD_TYPE.BOOLEAN,
    ...config,
  });

// ------------ Number filters ------------

/**
 * Number filter configuration
 */
export type TNumberConfig<V extends TFilterValue = number> = TCreateFilterConfigParams & {
  defaultValue?: V;
  min?: number;
  max?: number;
};

/**
 * Helper to get the number filter config
 * @param config - Number-specific configuration
 * @returns The number filter config
 */
export const getNumberConfig = <V extends TFilterValue = number>(config: TNumberConfig<V>) =>
  createFilterFieldConfig<typeof EXTENDED_FILTER_FIELD_TYPE.NUMBER, V>({
    type: EXTENDED_FILTER_FIELD_TYPE.NUMBER,
    ...config,
  });

// ------------ Number Range filters ------------

/**
 * Number range filter configuration
 */
export type TNumberRangeConfig<V extends TFilterValue = number> = TCreateFilterConfigParams & {
  defaultValue?: V[];
  min?: number;
  max?: number;
};

/**
 * Helper to get the number range filter config
 * @param config - Number range-specific configuration
 * @returns The number range filter config
 */
export const getNumberRangeConfig = <V extends TFilterValue = number>(config: TNumberRangeConfig<V>) =>
  createFilterFieldConfig<typeof EXTENDED_FILTER_FIELD_TYPE.NUMBER_RANGE, V>({
    type: EXTENDED_FILTER_FIELD_TYPE.NUMBER_RANGE,
    ...config,
  });

// ------------ Text filters ------------

/**
 * Text filter configuration
 */
export type TTextConfig<V extends TFilterValue = string> = TCreateFilterConfigParams & {
  defaultValue?: V;
  minLength?: number;
  maxLength?: number;
};

/**
 * Helper to get the text filter config
 * @param config - Text-specific configuration
 * @returns The text filter config
 */
export const getTextConfig = <V extends TFilterValue = string>(config: TTextConfig<V>) =>
  createFilterFieldConfig<typeof EXTENDED_FILTER_FIELD_TYPE.TEXT, V>({
    type: EXTENDED_FILTER_FIELD_TYPE.TEXT,
    ...config,
  });

// ------------ With value filters ------------

/**
 * With value configuration
 */
export type TWithValueConfig<V extends TFilterValue> = TCreateFilterConfigParams & {
  value: V;
};

/**
 * Helper to get the with value config
 * @param config - With value configuration
 * @returns The with value config
 */
export const getWithValueConfig = <V extends TFilterValue>(config: TWithValueConfig<V>) =>
  createFilterFieldConfig<typeof EXTENDED_FILTER_FIELD_TYPE.WITH_VALUE, V>({
    type: EXTENDED_FILTER_FIELD_TYPE.WITH_VALUE,
    ...config,
  });
