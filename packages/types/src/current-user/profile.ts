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

export type TUserProfile = {
  id: string | undefined;

  user: string | undefined;
  role: string | undefined;
  last_workspace_id: string | undefined;

  theme: {
    theme: string | undefined;
  };

  onboarding_step: {
    workspace_join: boolean;
    profile_complete: boolean;
    workspace_create: boolean;
    workspace_invite: boolean;
  };
  is_onboarded: boolean;
  is_tour_completed: boolean;

  use_case: string | undefined;

  billing_address_country: string | undefined;
  billing_address: string | undefined;
  has_billing_address: boolean;
  has_marketing_email_consent: boolean;

  created_at: Date | string;
  updated_at: Date | string;
};
