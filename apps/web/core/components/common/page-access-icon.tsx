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

import { ArchiveIcon, Earth } from "lucide-react";
import { EPageAccess } from "@plane/constants";
import { LockIcon } from "@plane/propel/icons";
import type { TPage } from "@plane/types";

export function PageAccessIcon(page: TPage) {
  return (
    <div>
      {page.archived_at ? (
        <ArchiveIcon className="h-2.5 w-2.5 text-tertiary" />
      ) : page.access === EPageAccess.PUBLIC ? (
        <Earth className="h-2.5 w-2.5 text-tertiary" />
      ) : (
        <LockIcon className="h-2.5 w-2.5 text-tertiary" />
      )}
    </div>
  );
}
