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

import React from "react";
import { range } from "lodash-es";

export function InboxSidebarLoader() {
  return (
    <div className="flex flex-col">
      {range(6).map((index) => (
        <div key={index} className="flex flex-col gap-2.5 h-[105px] space-y-3 border-b border-subtle p-4">
          <div className="flex flex-col gap-2">
            <span className="h-5 w-16 bg-layer-1 rounded-sm" />
            <span className="h-5 w-36 bg-layer-1 rounded-sm" />
          </div>
          <div className="flex items-center gap-2">
            <span className="h-4 w-20 bg-layer-1 rounded-sm" />
            <span className="h-2 w-2 bg-layer-1 rounded-full" />
            <span className="h-4 w-16 bg-layer-1 rounded-sm" />
            <span className="h-4 w-16 bg-layer-1 rounded-sm" />
          </div>
        </div>
      ))}
    </div>
  );
}
