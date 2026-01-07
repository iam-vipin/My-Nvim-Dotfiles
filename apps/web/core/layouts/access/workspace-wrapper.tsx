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

import { useParams } from "next/navigation";
import type { EUserPermissions } from "@plane/constants";
import { EUserPermissionsLevel } from "@plane/constants";
import { NotAuthorizedView } from "@/components/auth-screens/not-authorized-view";
import { useUserPermissions } from "@/hooks/store/user";
interface IWorkspaceAuthWrapper {
  children: React.ReactNode;
  pageKey: string;
  allowedPermissions?: EUserPermissions[];
}

function WorkspaceAccessWrapper({ children, ...props }: IWorkspaceAuthWrapper) {
  const { pageKey, allowedPermissions } = props;
  // router
  const { workspaceSlug } = useParams();
  // store
  const { hasPageAccess, allowPermissions } = useUserPermissions();
  // derived values
  const isAuthorized = allowedPermissions
    ? allowPermissions(allowedPermissions, EUserPermissionsLevel.WORKSPACE, workspaceSlug?.toString())
    : hasPageAccess(workspaceSlug?.toString() ?? "", pageKey);
  // render
  if (!isAuthorized) return <NotAuthorizedView />;
  return <>{children}</>;
}

export default WorkspaceAccessWrapper;
