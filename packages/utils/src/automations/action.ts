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

import { EAutomationChangePropertyType } from "@plane/types";

/**
 * Get the label for a change property type
 * @param property_name - The property name to get the label for
 * @returns The label for the property name
 */
export const getAutomationChangePropertyTypeLabel = (property_name: EAutomationChangePropertyType): string => {
  const labelMap: Map<EAutomationChangePropertyType, string> = new Map([
    [EAutomationChangePropertyType.STATE, "State"],
    [EAutomationChangePropertyType.PRIORITY, "Priority"],
    [EAutomationChangePropertyType.ASSIGNEE, "Assignee"],
    [EAutomationChangePropertyType.LABELS, "Labels"],
    [EAutomationChangePropertyType.START_DATE, "Start Date"],
    [EAutomationChangePropertyType.DUE_DATE, "Due Date"],
  ]);

  return labelMap.get(property_name) || "--";
};
