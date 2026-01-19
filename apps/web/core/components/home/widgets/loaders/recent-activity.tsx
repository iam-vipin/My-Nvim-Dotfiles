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
// ui
import { Loader } from "@plane/ui";

export function RecentActivityWidgetLoader() {
  return (
    <Loader className="rounded-xl px-2 space-y-6">
      {range(5).map((index) => (
        <div key={index} className="flex items-start gap-3.5">
          <div className="flex-shrink-0">
            <Loader.Item height="32px" width="32px" />
          </div>
          <div className="space-y-3 flex-shrink-0 w-full my-auto">
            <Loader.Item height="15px" width="70%" />
          </div>
        </div>
      ))}
    </Loader>
  );
}
