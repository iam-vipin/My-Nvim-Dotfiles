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

import type {
  SingleOrArray,
  TFilterConditionNodeForDisplay,
  TFilterProperty,
  TFilterValue,
  TSupportedFilterFieldConfigs,
} from "@plane/types";

export const COMMON_FILTER_ITEM_BORDER_CLASSNAME = "border-r border-subtle-1";

export const EMPTY_FILTER_PLACEHOLDER_TEXT = "--";

export type TFilterValueInputProps<P extends TFilterProperty, V extends TFilterValue> = {
  condition: TFilterConditionNodeForDisplay<P, V>;
  filterFieldConfig: TSupportedFilterFieldConfigs<V>;
  isDisabled?: boolean;
  onChange: (values: SingleOrArray<V>) => void;
};
