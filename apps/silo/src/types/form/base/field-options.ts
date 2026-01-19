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

// Base option interface
export interface BaseOption {
  value: string;
  label: string;
  description?: string;
}

// Specific option types
export interface SelectOption extends BaseOption {
  disabled?: boolean;
}

export interface UserOption extends BaseOption {
  avatar?: string;
  email?: string;
  isActive?: boolean;
}
