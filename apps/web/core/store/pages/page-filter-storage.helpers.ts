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

import { reaction } from "mobx";
import type { TPageFilterProps, TPageFilters, TPageFiltersSortBy, TPageFiltersSortKey } from "@plane/types";

export type TPageFilterStorageKeys = {
  sortKey: string;
  sortBy: string;
  filters: string;
};

// Valid values for page sort filters
const VALID_SORT_KEYS: readonly TPageFiltersSortKey[] = ["name", "created_at", "updated_at", "opened_at"] as const;
const VALID_SORT_BY: readonly TPageFiltersSortBy[] = ["asc", "desc"] as const;
const VALID_FILTER_KEYS: readonly (keyof TPageFilterProps)[] = ["created_at", "created_by", "favorites", "labels"];

/**
 * Safely get item from localStorage with try/catch
 */
const safeGetItem = (key: string): string | null => {
  try {
    if (typeof localStorage === "undefined") return null;
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

/**
 * Safely set item in localStorage with try/catch
 */
const safeSetItem = (key: string, value: string): void => {
  try {
    if (typeof localStorage === "undefined") return;
    localStorage.setItem(key, value);
  } catch {
    // Ignore storage errors (quota exceeded, private mode, etc.)
  }
};

/**
 * Safely remove item from localStorage with try/catch
 */
const safeRemoveItem = (key: string): void => {
  try {
    if (typeof localStorage === "undefined") return;
    localStorage.removeItem(key);
  } catch {
    // Ignore storage errors
  }
};

/**
 * Type guard to validate if a value is a valid TPageFiltersSortKey
 */
const isValidSortKey = (value: unknown): value is TPageFiltersSortKey =>
  typeof value === "string" && VALID_SORT_KEYS.includes(value as TPageFiltersSortKey);

/**
 * Type guard to validate if a value is a valid TPageFiltersSortBy
 */
const isValidSortBy = (value: unknown): value is TPageFiltersSortBy =>
  typeof value === "string" && VALID_SORT_BY.includes(value as TPageFiltersSortBy);

/**
 * Validates and sanitizes page filter props from localStorage
 * Only allows known filter keys with appropriate value types
 */
const validatePageFilterProps = (value: unknown): TPageFilterProps | null => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;

  const sanitized: TPageFilterProps = {};
  const record = value as Record<string, unknown>;

  for (const key of VALID_FILTER_KEYS) {
    if (!(key in record)) continue;

    const val = record[key];

    if (key === "favorites") {
      // favorites must be a boolean
      if (typeof val === "boolean") {
        sanitized.favorites = val;
      }
    } else if (key === "created_at" || key === "created_by" || key === "labels") {
      // These must be string arrays or null
      if (val === null) {
        sanitized[key] = null;
      } else if (Array.isArray(val) && val.every((item): item is string => typeof item === "string")) {
        sanitized[key] = val;
      }
    }
  }

  return Object.keys(sanitized).length > 0 ? sanitized : null;
};

/**
 * Restores page filters from localStorage
 * @param filters - The filters object to restore values into
 * @param storageKeys - The localStorage keys to read from
 */
export const restorePageFiltersFromStorage = (filters: TPageFilters, storageKeys: TPageFilterStorageKeys): void => {
  const storedSortKey = safeGetItem(storageKeys.sortKey);
  const storedSortBy = safeGetItem(storageKeys.sortBy);
  const storedFilters = safeGetItem(storageKeys.filters);

  // Validate sort values against allowed values, remove invalid ones to keep state in sync
  if (storedSortKey !== null) {
    if (isValidSortKey(storedSortKey)) {
      filters.sortKey = storedSortKey;
    } else {
      safeRemoveItem(storageKeys.sortKey);
    }
  }

  if (storedSortBy !== null) {
    if (isValidSortBy(storedSortBy)) {
      filters.sortBy = storedSortBy;
    } else {
      safeRemoveItem(storageKeys.sortBy);
    }
  }

  if (storedFilters) {
    try {
      const parsedFilters: unknown = JSON.parse(storedFilters);
      const validatedFilters = validatePageFilterProps(parsedFilters);
      if (validatedFilters) {
        filters.filters = validatedFilters;
      } else {
        safeRemoveItem(storageKeys.filters);
      }
    } catch {
      // Invalid JSON - remove to keep state in sync
      safeRemoveItem(storageKeys.filters);
    }
  }
};

/**
 * Sets up reactions to persist page filters to localStorage when they change
 * @param filters - The filters object to observe
 * @param storageKeys - The localStorage keys to save to
 * @returns Array of disposer functions for cleanup
 */
export const setupPageFilterStorageReactions = (
  filters: TPageFilters,
  storageKeys: TPageFilterStorageKeys
): (() => void)[] => {
  const disposers: (() => void)[] = [];

  // Reaction to save sort filters to localStorage when they change
  const sortReactionDisposer = reaction(
    () => ({ sortKey: filters.sortKey, sortBy: filters.sortBy }),
    ({ sortKey, sortBy }) => {
      safeSetItem(storageKeys.sortKey, sortKey);
      safeSetItem(storageKeys.sortBy, sortBy);
    }
  );
  disposers.push(sortReactionDisposer);

  // Reaction to save filters to localStorage when they change
  // Use JSON.stringify to detect in-place mutations of the filters object
  const filtersReactionDisposer = reaction(
    () => JSON.stringify(filters.filters ?? {}),
    (filterValuesJson) => {
      const filterValues = JSON.parse(filterValuesJson) as TPageFilterProps;
      if (filterValues && Object.keys(filterValues).length > 0) {
        safeSetItem(storageKeys.filters, filterValuesJson);
      } else {
        safeRemoveItem(storageKeys.filters);
      }
    }
  );
  disposers.push(filtersReactionDisposer);

  return disposers;
};
