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
// ui
import { Loader } from "@plane/ui";
import { InboxSidebarLoader } from "./inbox-sidebar-loader";

export function InboxLayoutLoader() {
  return (
    <div className="relative w-full h-full flex overflow-hidden">
      <div className="flex-shrink-0 w-2/6 h-full border-r border-strong">
        <InboxSidebarLoader />
      </div>
      <div className="w-4/6">
        <Loader className="flex flex-col h-full gap-5 p-5">
          <div className="space-y-2">
            <Loader.Item height="30px" width="40%" />
            <Loader.Item height="15px" width="60%" />
            <Loader.Item height="15px" width="60%" />
            <Loader.Item height="15px" width="40%" />
          </div>
          <Loader.Item height="150px" />
        </Loader>
      </div>
    </div>
  );
}
