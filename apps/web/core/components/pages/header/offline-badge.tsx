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
import { WifiOff } from "lucide-react";
// plane imports
import { Tooltip } from "@plane/propel/tooltip";
// hooks
import useOnlineStatus from "@/hooks/use-online-status";
import type { TPageInstance } from "@/store/pages/base-page";

type Props = {
  page: TPageInstance;
};

export const PageOfflineBadge = observer(function PageOfflineBadge({ page }: Props) {
  // use online status
  const { isOnline } = useOnlineStatus();

  if (isOnline) return null;

  return (
    <Tooltip
      tooltipHeading="You are offline."
      tooltipContent="You can continue making changes. They will be synced when you are back online."
    >
      <div className="flex-shrink-0 h-6 flex items-center gap-1 px-2 rounded-sm text-secondary bg-layer-1">
        <WifiOff className="flex-shrink-0 size-3.5" />
        <span className="text-11 font-medium">Offline</span>
      </div>
    </Tooltip>
  );
});
