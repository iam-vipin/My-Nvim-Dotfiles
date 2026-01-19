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

import { observer } from "mobx-react";
import Link from "next/link";
import { Outlet } from "react-router";
import { ChevronLeftIcon } from "lucide-react";
// components
import { SettingsContentWrapper } from "@/components/settings/content-wrapper";
// local imports
import type { Route } from "./+types/layout";

function TemplatesLayout({ params }: Route.ComponentProps) {
  // router params
  const { workspaceSlug } = params;

  return (
    <SettingsContentWrapper header={null}>
      <div className="w-full h-full">
        <Link
          href={`/${workspaceSlug}/settings/templates`}
          className="inline-flex items-center gap-2 text-13 font-semibold text-tertiary mb-6"
        >
          <ChevronLeftIcon className="w-4 h-4" />
          Back to templates
        </Link>
        <Outlet />
      </div>
    </SettingsContentWrapper>
  );
}

export default observer(TemplatesLayout);
