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

import { Crown } from "lucide-react";
import { Button } from "@plane/propel/button";

export function IssueEmbedUpgradeCard() {
  return (
    <div
      className={
        "w-full h-min cursor-pointer space-y-2.5 rounded-lg bg-surface-1/30 border-[0.5px] border-subtle-1 shadow-raised-100"
      }
    >
      <div className="relative h-[71%]">
        <div className="h-full backdrop-filter backdrop-blur-[30px] flex items-center w-full justify-between gap-5  pl-4 pr-5 py-3 max-md:max-w-full max-md:flex-wrap relative">
          <div className="flex-col items-center">
            <div className="rounded p-2 bg-surface-2 w-min mb-3">
              <Crown size={16} color="#FFBA18" />
            </div>
            <div className="text-base">Embed and access work items in pages seamlessly, upgrade to plane pro now.</div>
          </div>
          <Button className="py-2" variant="primary" onClick={() => {}}>
            Upgrade
          </Button>
        </div>
      </div>
    </div>
  );
}
