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
import { observer } from "mobx-react";
// layouts
import { WorkspaceAuthWrapper as CoreWorkspaceAuthWrapper } from "@/layouts/auth-layout/workspace-wrapper";

export type IWorkspaceAuthWrapper = {
  children: React.ReactNode;
};

export const WorkspaceAuthWrapper = observer(function WorkspaceAuthWrapper(props: IWorkspaceAuthWrapper) {
  // props
  const { children } = props;

  return <CoreWorkspaceAuthWrapper>{children}</CoreWorkspaceAuthWrapper>;
});
