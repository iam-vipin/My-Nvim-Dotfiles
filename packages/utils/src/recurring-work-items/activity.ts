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
  TRecurringWorkItemActivityFields,
  TRecurringWorkItemActivityKeys,
  TRecurringWorkItemActivityVerbs,
} from "@plane/types";

/**
 * Get the key for the recurring work item activity based on the field and verb
 * @param recurringWorkItemActivityField - The field of the recurring work item activity
 * @param recurringWorkItemActivityVerb - The verb of the recurring work item activity
 * @returns The key for the recurring work item activity
 */
export const getRecurringWorkItemActivityKey = (
  recurringWorkItemActivityField: TRecurringWorkItemActivityFields | undefined,
  recurringWorkItemActivityVerb: TRecurringWorkItemActivityVerbs
) =>
  `${recurringWorkItemActivityField ? `${recurringWorkItemActivityField}_` : ""}${recurringWorkItemActivityVerb}` as TRecurringWorkItemActivityKeys;
