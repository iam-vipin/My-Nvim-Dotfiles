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

import type { TLogoProps } from "../common";

export type IFavorite = {
  id: string;
  name: string;
  entity_type: string;
  entity_data: {
    id?: string;
    name: string;
    logo_props?: TLogoProps | undefined;
  };
  is_folder: boolean;
  sort_order: number;
  parent: string | null;
  entity_identifier?: string | null;
  children: IFavorite[];
  project_id: string | null;
  sequence: number;
  workspace_id: string;
};
