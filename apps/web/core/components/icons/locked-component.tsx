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

import { LockIcon } from "@plane/propel/icons";
import { Tooltip } from "@plane/propel/tooltip";

export function LockedComponent(props: { toolTipContent?: string }) {
  const { toolTipContent } = props;
  const lockedComponent = (
    <div className="flex-shrink-0 flex h-7 items-center gap-2 rounded-full bg-layer-1 px-3 py-0.5 text-11 font-medium text-tertiary">
      <LockIcon className="h-3 w-3" />
      <span>Locked</span>
    </div>
  );

  return (
    <>
      {toolTipContent ? <Tooltip tooltipContent={toolTipContent}>{lockedComponent}</Tooltip> : <>{lockedComponent}</>}
    </>
  );
}
