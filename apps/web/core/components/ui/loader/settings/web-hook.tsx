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

export function WebhookSettingsLoader() {
  return (
    <div className="h-full w-full overflow-hidden py-8 pr-9">
      <div className="flex h-full w-full flex-col">
        <div className="flex items-center justify-between gap-4 border-b border-subtle pb-3.5">
          <div className="text-18 font-medium">Webhooks</div>
          <span className="h-8 w-28 bg-layer-1 rounded-sm" />
        </div>
        <div className="h-full w-full overflow-y-auto">
          <div className="border-b border-subtle">
            <div>
              <span className="flex items-center justify-between gap-4 px-3.5 py-[18px]">
                <span className="h-5 w-36 bg-layer-1 rounded-sm" />
                <span className="h-6 w-12 bg-layer-1 rounded-sm" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
