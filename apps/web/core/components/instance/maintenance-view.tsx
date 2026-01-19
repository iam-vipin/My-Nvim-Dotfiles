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

import type { FC } from "react";
import { useTheme } from "next-themes";
// assets
import maintenanceModeDarkModeImage from "@/app/assets/instance/maintenance-mode-dark.svg?url";
import maintenanceModeLightModeImage from "@/app/assets/instance/maintenance-mode-light.svg?url";
// layouts
import DefaultLayout from "@/layouts/default-layout";
// components
import { MaintenanceMessage } from "@/plane-web/components/instance";

export function MaintenanceView() {
  // hooks
  const { resolvedTheme } = useTheme();
  // derived values
  const maintenanceModeImage = resolvedTheme === "dark" ? maintenanceModeDarkModeImage : maintenanceModeLightModeImage;
  return (
    <DefaultLayout>
      <div className="relative container mx-auto h-full w-full max-w-xl flex flex-col gap-2 items-center justify-center gap-y-6 bg-surface-1 text-center">
        <div className="relative w-full">
          <img
            src={maintenanceModeImage}
            height="176"
            width="288"
            alt="ProjectSettingImg"
            className="w-full h-full object-fill object-center"
          />
        </div>
        <div className="w-full relative flex flex-col gap-4 mt-4">
          <MaintenanceMessage />
        </div>
      </div>
    </DefaultLayout>
  );
}
