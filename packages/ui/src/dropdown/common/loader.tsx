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
import React from "react";

export function DropdownOptionsLoader() {
  return (
    <div className="flex flex-col gap-1 animate-pulse">
      {range(6).map((index) => (
        <div key={index} className="flex h-[1.925rem] w-full rounded-sm px-1 py-1.5 bg-surface-2" />
      ))}
    </div>
  );
}
