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

import type { TFilterValue } from "../expression";
import type { TCoreFilterFieldConfigs } from "./core";
import { CORE_FILTER_FIELD_TYPE } from "./core";
import type { TExtendedFilterFieldConfigs } from "./extended";
import { EXTENDED_FILTER_FIELD_TYPE } from "./extended";

// -------- COMPOSED FILTER TYPES --------

export const FILTER_FIELD_TYPE = {
  ...CORE_FILTER_FIELD_TYPE,
  ...EXTENDED_FILTER_FIELD_TYPE,
} as const;

export type TFilterFieldType = (typeof FILTER_FIELD_TYPE)[keyof typeof FILTER_FIELD_TYPE];

// -------- COMPOSED CONFIGURATIONS --------

/**
 * All supported filter configurations.
 */
export type TSupportedFilterFieldConfigs<V extends TFilterValue = TFilterValue> =
  | TCoreFilterFieldConfigs<V>
  | TExtendedFilterFieldConfigs<V>;

// -------- RE-EXPORTS --------

export * from "./shared";
export * from "./core";
export * from "./extended";
