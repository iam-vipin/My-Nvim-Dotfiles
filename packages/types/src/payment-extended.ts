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

import type { EProductSubscriptionEnum, TBillingFrequency } from "./payment";

export type TProductSubscription<P extends EProductSubscriptionEnum = EProductSubscriptionEnum> = {
  product: P;
  purchased_seats: number | undefined;
  free_seats: number | null;
  current_period_start_date: string | null;
  current_period_end_date: string | null;
  is_cancelled?: boolean;
  interval?: TBillingFrequency | null;
  is_offline_payment: boolean;
  trial_end_date: string | undefined;
  has_added_payment_method: boolean;
  has_activated_free_trial: boolean;
  subscription: string | undefined;
  is_self_managed: boolean;
  billable_members: number | null;
  occupied_seats: number | null;
};

export type IWorkspaceProductSubscription = TProductSubscription & {
  is_on_trial: boolean;
  is_trial_allowed: boolean;
  remaining_trial_days: number | null;
  is_trial_ended: boolean;
  has_upgraded: boolean;
  show_payment_button: boolean;
  show_trial_banner: boolean;
  show_seats_banner: boolean;
  is_free_member_count_exceeded: boolean;
  can_delete_workspace: boolean;
};

export type TInstanceEnterpriseSubscription = TProductSubscription<EProductSubscriptionEnum.ENTERPRISE>;

export type TMemberInviteCheck = {
  invite_allowed: boolean;
  allowed_admin_members: number;
  allowed_guests: number;
  allowed_total_users: number | null; // Remaining allowed users for the instance (Enterprise plan only - includes all active and invited users)
};

export type TUpdateSeatVariant = "ADD_SEATS" | "REMOVE_SEATS";

export type TAddWorkspaceSeatsModal = {
  isOpen: boolean;
};

export type TProrationPreview = {
  quantity_difference: number;
  per_seat_prorated_amount: number;
  current_quantity: number;
  new_quantity: number;
  total_prorated_amount: number;
  current_price_amount: number;
  current_price_interval: "MONTHLY" | "YEARLY";
};

export type TUpgradeParams = {
  selectedSubscriptionType: EProductSubscriptionEnum;
  selectedProductId: string | undefined;
  selectedPriceId: string | undefined;
  isActive: boolean;
};
