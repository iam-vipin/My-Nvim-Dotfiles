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
import type {
  TCoreAllAvailableDateFilterOperatorsForDisplay,
  TCoreAllAvailableSelectFilterOperatorsForDisplay,
  TCoreSupportedDateFilterOperators,
  TCoreSupportedSelectFilterOperators,
} from "./core";
import type {
  TExtendedAllAvailableDateFilterOperatorsForDisplay,
  TExtendedAllAvailableSelectFilterOperatorsForDisplay,
  TExtendedSupportedDateFilterOperators,
  TExtendedSupportedSelectFilterOperators,
} from "./extended";

// -------- COMPOSED SUPPORT TYPES --------

/**
 * All supported date filter operators.
 */
export type TSupportedDateFilterOperators<V extends TFilterValue = TFilterValue> =
  | TCoreSupportedDateFilterOperators<V>
  | TExtendedSupportedDateFilterOperators<V>;

export type TAllAvailableDateFilterOperatorsForDisplay<V extends TFilterValue = TFilterValue> =
  | TCoreAllAvailableDateFilterOperatorsForDisplay<V>
  | TExtendedAllAvailableDateFilterOperatorsForDisplay<V>;

/**
 * All supported select filter operators.
 */
export type TSupportedSelectFilterOperators<V extends TFilterValue = TFilterValue> =
  | TCoreSupportedSelectFilterOperators<V>
  | TExtendedSupportedSelectFilterOperators<V>;

export type TAllAvailableSelectFilterOperatorsForDisplay<V extends TFilterValue = TFilterValue> =
  | TCoreAllAvailableSelectFilterOperatorsForDisplay<V>
  | TExtendedAllAvailableSelectFilterOperatorsForDisplay<V>;

// -------- RE-EXPORTS --------

export * from "./shared";
export * from "./core";
export * from "./extended";
