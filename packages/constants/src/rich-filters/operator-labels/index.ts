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

import type { TAllAvailableOperatorsForDisplay, TAllAvailableDateFilterOperatorsForDisplay } from "@plane/types";
import { CORE_OPERATOR_LABELS_MAP, CORE_DATE_OPERATOR_LABELS_MAP } from "./core";
import {
  EXTENDED_OPERATOR_LABELS_MAP,
  EXTENDED_DATE_OPERATOR_LABELS_MAP,
  NEGATED_OPERATOR_LABELS_MAP,
  NEGATED_DATE_OPERATOR_LABELS_MAP,
} from "./extended";

/**
 * Empty operator label for unselected state
 */
export const EMPTY_OPERATOR_LABEL = "--";

/**
 * Complete operator labels mapping - combines core, extended, and negated labels
 */
export const OPERATOR_LABELS_MAP: Record<TAllAvailableOperatorsForDisplay, string> = {
  ...CORE_OPERATOR_LABELS_MAP,
  ...EXTENDED_OPERATOR_LABELS_MAP,
  ...NEGATED_OPERATOR_LABELS_MAP,
} as const;

/**
 * Complete date operator labels mapping - combines core, extended, and negated labels
 */
export const DATE_OPERATOR_LABELS_MAP: Record<TAllAvailableDateFilterOperatorsForDisplay, string> = {
  ...CORE_DATE_OPERATOR_LABELS_MAP,
  ...EXTENDED_DATE_OPERATOR_LABELS_MAP,
  ...NEGATED_DATE_OPERATOR_LABELS_MAP,
} as const;

// -------- RE-EXPORTS --------

export * from "./core";
export * from "./extended";
