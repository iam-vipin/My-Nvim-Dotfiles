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

import { HomeIcon } from "@plane/propel/icons";
// plane imports
import { Breadcrumbs, Header } from "@plane/ui";
// components
import { BreadcrumbLink } from "@/components/common/breadcrumb-link";

export function PagesAppDashboardHeader() {
  return (
    <Header>
      <Header.LeftItem>
        <div>
          <Breadcrumbs>
            <Breadcrumbs.Item
              component={<BreadcrumbLink label="Home" icon={<HomeIcon className="h-4 w-4 text-tertiary" />} />}
            />
          </Breadcrumbs>
        </div>
      </Header.LeftItem>
    </Header>
  );
}
