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

export function ViewListLoader() {
  return (
    <div className="flex h-full w-full flex-col animate-pulse">
      {range(8).map((i) => (
        <div key={i} className="group border-b border-subtle">
          <div className="relative flex w-full items-center justify-between rounded-sm p-4">
            <div className="flex items-center gap-4">
              <span className="min-h-10 min-w-10 bg-layer-1 rounded-sm" />
              <span className="h-6 w-28 bg-layer-1 rounded-sm" />
            </div>
            <div className="flex items-center gap-2">
              <span className="h-5 w-5 bg-layer-1 rounded-sm" />
              <span className="h-5 w-5 bg-layer-1 rounded-sm" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
