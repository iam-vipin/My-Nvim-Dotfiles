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
// components
import { PageWrapper } from "@/components/common/page-wrapper";
// plane admin imports
// types
// import type { Route } from "./+types/page";

function UserManagementPage() {
  return (
    <PageWrapper
      header={{
        title: "Instance-Level User Management",
        description: "View and manage seats for all the members active in this instance",
      }}
      size="lg"
    >
      Instance-Level User Management
    </PageWrapper>
  );
}

// export const meta: Route.MetaFunction = () => [{ title: "User Management - God Mode" }];

export default observer(UserManagementPage);
