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

export function IntegrationsSettingsLoader() {
  return (
    <div className="divide-y-[0.5px] divide-subtle animate-pulse">
      {range(2).map((i) => (
        <div key={i} className="flex items-center justify-between gap-2 border-b border-subtle bg-surface-1 px-4 py-6">
          <div className="flex items-start gap-4">
            <span className="h-10 w-10 bg-layer-1 rounded-full" />
            <div className="flex flex-col gap-1">
              <span className="h-5 w-20 bg-layer-1 rounded-sm" />
              <span className="h-4 w-60 bg-layer-1 rounded-sm" />
            </div>
          </div>
          <span className="h-8 w-16 bg-layer-1 rounded-sm" />
        </div>
      ))}
    </div>
  );
}
