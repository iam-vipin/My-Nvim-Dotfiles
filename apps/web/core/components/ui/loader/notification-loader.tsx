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

import { range } from "lodash-es";

export function NotificationsLoader() {
  return (
    <div className="divide-y divide-subtle animate-pulse overflow-hidden">
      {range(3).map((i) => (
        <div key={i} className="flex w-full items-center gap-4 p-3">
          <span className="min-h-12 min-w-12 bg-layer-1 rounded-full" />
          <div className="flex flex-col gap-2.5 w-full">
            <span className="h-5 w-36 bg-layer-1 rounded-sm" />
            <div className="flex items-center justify-between gap-2 w-full">
              <span className="h-5 w-28 bg-layer-1 rounded-sm" />
              <span className="h-5 w-16 bg-layer-1 rounded-sm" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
