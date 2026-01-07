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
import type { TSupportedOperators, TAllAvailableOperatorsForDisplay } from "@plane/types";

// -------- OPERATOR HELPER UTILITIES --------

/**
 * Type guard to check if an operator is positive (not prefixed with -)
 */
export const isPositiveOperator = (operator: TAllAvailableOperatorsForDisplay): operator is TSupportedOperators =>
  !operator.startsWith("-");

/**
 * Type guard to check if an operator is negative (prefixed with -)
 */
export const isNegativeOperator = (operator: TAllAvailableOperatorsForDisplay): operator is `-${TSupportedOperators}` =>
  operator.startsWith("-");

/**
 * Converts a positive operator to its negative counterpart
 */
export const toNegativeOperator = <T extends TSupportedOperators>(operator: T): `-${T}` => `-${operator}`;

/**
 * Converts a negative operator to its positive counterpart
 */
export const toPositiveOperator = <T extends `-${TSupportedOperators}`>(
  operator: T
): T extends `-${infer U extends TSupportedOperators}` ? U : never =>
  operator.slice(1) as T extends `-${infer U extends TSupportedOperators}` ? U : never;
