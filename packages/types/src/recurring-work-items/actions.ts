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

// local imports
import type { PartialDeep } from "../utils";
import type { TRecurringWorkItem } from "./root";

export interface IRecurringWorkItemActionCallbacks {
  create: (recurringWorkItem: PartialDeep<TRecurringWorkItem>) => Promise<TRecurringWorkItem>;
  update: (recurringWorkItemId: string, data: PartialDeep<TRecurringWorkItem>) => Promise<TRecurringWorkItem>;
  destroy: (recurringWorkItem: TRecurringWorkItem) => Promise<void>;
}
