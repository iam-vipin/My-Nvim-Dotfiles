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

export enum EProductSubscriptionEnum {
  FREE = "FREE",
  ONE = "ONE",
  PRO = "PRO",
  BUSINESS = "BUSINESS",
  ENTERPRISE = "ENTERPRISE",
}

export type TBillingFrequency = "month" | "year";

export type IPaymentProductPrice = {
  currency: string;
  id: string;
  product: string;
  recurring: TBillingFrequency;
  unit_amount: number;
  workspace_amount: number;
};

export type TProductSubscriptionType = "FREE" | "ONE" | "PRO" | "BUSINESS" | "ENTERPRISE";

export type IPaymentProduct = {
  description: string;
  id: string;
  name: string;
  type: Omit<TProductSubscriptionType, "FREE">;
  payment_quantity: number;
  prices: IPaymentProductPrice[];
  is_active: boolean;
};

export type TSubscriptionPrice = {
  key: string;
  id: string | undefined;
  currency: string;
  price: number;
  recurring: TBillingFrequency;
};

export type TProductBillingFrequency = {
  [key in EProductSubscriptionEnum]: TBillingFrequency | undefined;
};
