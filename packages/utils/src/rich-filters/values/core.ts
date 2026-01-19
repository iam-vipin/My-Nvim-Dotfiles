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

import type { SingleOrArray, TFilterValue } from "@plane/types";

/**
 * Converts any value to a non-null array for UI components that expect arrays
 * Returns empty array for null/undefined values
 */
export const toFilterArray = <V extends TFilterValue>(value: SingleOrArray<V>): NonNullable<V>[] => {
  if (value === null || value === undefined) {
    return [];
  }

  return Array.isArray(value) ? (value as NonNullable<V>[]) : ([value] as NonNullable<V>[]);
};

/**
 * Gets the length of a filter value
 */
export const getFilterValueLength = <V extends TFilterValue>(value: SingleOrArray<V>): number => {
  if (value === null || value === undefined) {
    return 0;
  }

  return Array.isArray(value) ? value.length : 1;
};
