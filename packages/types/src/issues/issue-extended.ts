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

export type TWorkItemExtended = {
  customer_ids?: string[];
  customer_request_ids?: string[];
  initiative_ids?: string[];
  milestone_id?: string;
  transferred_cycle_ids?: string[];
};

export type TWorkItemWidgetsExtended = "customer_requests" | "pages";
