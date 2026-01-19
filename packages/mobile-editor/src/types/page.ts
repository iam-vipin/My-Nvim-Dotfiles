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

import type { EPageAccess, TLogoProps } from "@plane/types";

export type TPage = {
  access: EPageAccess | undefined;
  archivedAt: string | null | undefined;
  canView: boolean;
  canEdit: boolean;
  deletedAt: string | null | undefined;
  id: string | undefined;
  isDescriptionEmpty: boolean | undefined;
  isLocked: boolean;
  name: string | undefined;
  projects?: string[] | undefined;
  workspace: string | undefined;
  logoProps: TLogoProps | undefined;
  ownedBy: string | undefined;
};
