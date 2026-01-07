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
import type { IFilterAdapter, TExternalFilter, TFilterExpression, TFilterProperty } from "@plane/types";

/**
 * Abstract base class for converting between external filter formats and internal filter expressions.
 * Provides common utilities for creating and manipulating filter nodes.
 *
 * @template K - Property key type that extends TFilterProperty
 * @template E - External filter type that extends TExternalFilter
 */
export abstract class FilterAdapter<K extends TFilterProperty, E extends TExternalFilter> implements IFilterAdapter<
  K,
  E
> {
  /**
   * Converts an external filter format to internal filter expression.
   * Must be implemented by concrete adapter classes.
   *
   * @param externalFilter - The external filter to convert
   * @returns The internal filter expression or null if conversion fails
   */
  abstract toInternal(externalFilter: E): TFilterExpression<K> | null;

  /**
   * Converts an internal filter expression to external filter format.
   * Must be implemented by concrete adapter classes.
   *
   * @param internalFilter - The internal filter expression to convert
   * @returns The external filter format
   */
  abstract toExternal(internalFilter: TFilterExpression<K> | null): E;
}
