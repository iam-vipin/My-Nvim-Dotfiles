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

export function ImportExportSettingsLoader() {
  return (
    <div className="divide-y-[0.5px] divide-subtle-1 animate-pulse">
      {range(2).map((i) => (
        <div key={i} className="flex items-center justify-between gap-2 px-4 py-3">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <span className="h-5 w-16 bg-layer-1 rounded-sm" />
              <span className="h-5 w-16 bg-layer-1 rounded-sm" />
            </div>
            <div className="flex items-center gap-2">
              <span className="h-4 w-28 bg-layer-1 rounded-sm" />
              <span className="h-4 w-28 bg-layer-1 rounded-sm" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
