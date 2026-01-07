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

import { observer } from "mobx-react";
// plane imports
import { ArchiveIcon } from "@plane/propel/icons";
import { renderFormattedDate } from "@plane/utils";
// store
import type { TPageInstance } from "@/store/pages/base-page";

type Props = {
  page: TPageInstance;
};

export const PageArchivedBadge = observer(function PageArchivedBadge({ page }: Props) {
  if (!page.archived_at) return null;

  return (
    <div className="flex-shrink-0 h-6 flex items-center gap-1 px-2 rounded-sm text-accent-primary bg-accent-primary/20">
      <ArchiveIcon className="flex-shrink-0 size-3.5" />
      <span className="text-11 font-medium">Archived at {renderFormattedDate(page.archived_at)}</span>
    </div>
  );
});
