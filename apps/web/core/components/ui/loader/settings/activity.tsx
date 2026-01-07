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
import { getRandomLength } from "../utils";

export function ActivitySettingsLoader() {
  return (
    <div className="flex flex-col gap-3 animate-pulse">
      {range(10).map((i) => (
        <div key={i} className="relative flex items-center gap-2 h-12 border-b border-subtle">
          <span className="h-6 w-6 bg-layer-1 rounded-sm" />
          <span className={`h-6 w-${getRandomLength(["52", "72", "96"])} bg-layer-1 rounded-sm`} />
        </div>
      ))}
    </div>
  );
}
