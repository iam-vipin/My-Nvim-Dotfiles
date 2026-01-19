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

import type { TAddWorkspaceSeatsModal } from "@plane/types";
import { EProductSubscriptionEnum } from "@plane/types";

// Product subscription tiers
export enum EProductSubscriptionTier {
  FREE = 0,
  ONE = 5,
  PRO = 10,
  BUSINESS = 20,
  ENTERPRISE = 30,
}

export const DEFAULT_ADD_WORKSPACE_SEATS_MODAL_DATA: TAddWorkspaceSeatsModal = {
  isOpen: false,
};

/**
 * Subscription types that support trial periods
 */
export const SUBSCRIPTION_WITH_TRIAL = [EProductSubscriptionEnum.BUSINESS];

/**
 * Subscription types that support seats management
 */
export const SUBSCRIPTION_WITH_SEATS_MANAGEMENT = [
  EProductSubscriptionEnum.PRO,
  EProductSubscriptionEnum.BUSINESS,
  EProductSubscriptionEnum.ENTERPRISE,
];
