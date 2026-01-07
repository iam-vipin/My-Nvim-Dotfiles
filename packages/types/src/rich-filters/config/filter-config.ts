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

import type { TFilterProperty } from "../expression";
import type { TOperatorConfigMap } from "../operator-configs";

/**
 * Main filter configuration type for different properties.
 * This is the primary configuration type used throughout the application.
 *
 * @template P - Property key type (e.g., 'state_id', 'priority', 'assignee')
 * @template V - Value type for the filter
 */
export type TFilterConfig<P extends TFilterProperty> = {
  id: P;
  label: string;
  icon?: React.FC<React.SVGAttributes<SVGElement>>;
  isEnabled: boolean;
  allowMultipleFilters?: boolean;
  supportedOperatorConfigsMap: TOperatorConfigMap;
  rightContent?: React.ReactNode; // content to display on the right side of the filter option in the dropdown
  tooltipContent?: React.ReactNode; // content to display when hovering over the applied filter item in the filter list
};
