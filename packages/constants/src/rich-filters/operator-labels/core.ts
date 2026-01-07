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

import type { TCoreSupportedOperators, TCoreSupportedDateFilterOperators } from "@plane/types";
import { CORE_EQUALITY_OPERATOR, CORE_COLLECTION_OPERATOR, CORE_COMPARISON_OPERATOR } from "@plane/types";

/**
 * Core operator labels
 */
export const CORE_OPERATOR_LABELS_MAP: Record<TCoreSupportedOperators, string> = {
  [CORE_EQUALITY_OPERATOR.EXACT]: "is",
  [CORE_COLLECTION_OPERATOR.IN]: "is any of",
  [CORE_COMPARISON_OPERATOR.RANGE]: "between",
} as const;

/**
 * Core date-specific operator labels
 */
export const CORE_DATE_OPERATOR_LABELS_MAP: Record<TCoreSupportedDateFilterOperators, string> = {
  [CORE_EQUALITY_OPERATOR.EXACT]: "is",
  [CORE_COMPARISON_OPERATOR.RANGE]: "between",
} as const;
