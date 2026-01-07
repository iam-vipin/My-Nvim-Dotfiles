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

import type { TLogoProps } from "./common";

export type TSticky = {
  created_at?: string | undefined;
  created_by?: string | undefined;
  background_color?: string | null | undefined;
  description?: object | undefined;
  description_html?: string | undefined;
  id: string;
  logo_props: TLogoProps | undefined;
  name?: string;
  sort_order: number | undefined;
  updated_at?: string | undefined;
  updated_by?: string | undefined;
  workspace: string | undefined;
};
