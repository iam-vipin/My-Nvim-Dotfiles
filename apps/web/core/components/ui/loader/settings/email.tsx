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

export function EmailSettingsLoader() {
  return (
    <div className="mx-auto mt-8 h-full w-full overflow-y-auto px-6 lg:px-20 pb- animate-pulse">
      <div className="flex flex-col gap-2 pt-6 mb-2 pb-6 border-b border-subtle">
        <span className="h-7 w-40 bg-layer-1 rounded-sm" />
        <span className="h-5 w-96 bg-layer-1 rounded-sm" />
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex items-center py-3">
          <span className="h-7 w-32 bg-layer-1 rounded-sm" />
        </div>
        {range(4).map((i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex flex-col gap-2 py-3">
              <span className="h-6 w-28 bg-layer-1 rounded-sm" />
              <span className="h-5 w-96 bg-layer-1 rounded-sm" />
            </div>
            <div className="flex items-center">
              <span className="h-5 w-5 bg-layer-1 rounded-sm" />
            </div>
          </div>
        ))}
        <div className="flex items-center py-12">
          <span className="h-8 w-32 bg-layer-1 rounded-sm" />
        </div>
      </div>
    </div>
  );
}
