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

import Link from "next/link";
import { Outlet } from "react-router";
import { ChevronLeftIcon } from "lucide-react";
// local imports
import type { Route } from "./+types/layout";

function IntegrationLayout({ params }: Route.ComponentProps) {
  const { workspaceSlug } = params;
  return (
    <>
      <Link
        href={`/${workspaceSlug}/settings/integrations`}
        className="flex items-center gap-2 text-body-xs-semibold text-tertiary mb-6"
      >
        <ChevronLeftIcon className="w-4 h-4" />
        Back to integrations
      </Link>
      <Outlet />
    </>
  );
}

export default IntegrationLayout;
