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

import { CreditCard, Users } from "lucide-react";
// types
import type { TSidebarMenuItem } from "./types";

export type TExtendedSidebarMenuKey = "billing" | "user-management";

export const extendedSidebarMenuLinks: Record<TExtendedSidebarMenuKey, TSidebarMenuItem> = {
  billing: {
    Icon: CreditCard,
    name: "Billing",
    description: "Active plans",
    href: `/billing/`,
  },
  "user-management": {
    Icon: Users,
    name: "User Management",
    description: "Instance user management",
    href: `/user-management/`,
  },
};
