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

export interface IApiToken {
  created_at: string;
  created_by: string;
  description: string;
  expired_at: string | null;
  id: string;
  is_active: boolean;
  label: string;
  last_used: string | null;
  updated_at: string;
  updated_by: string;
  user: string;
  user_type: number;
  token?: string;
  workspace: string;
}
