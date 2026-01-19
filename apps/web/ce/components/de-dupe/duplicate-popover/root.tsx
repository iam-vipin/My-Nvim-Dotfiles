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
import React from "react";
import { observer } from "mobx-react";
// types
import type { TDeDupeIssue } from "@plane/types";
import type { TIssueOperations } from "@/components/issues/issue-detail";

type TDeDupeIssuePopoverRootProps = {
  workspaceSlug: string;
  projectId: string;
  rootIssueId: string;
  issues: TDeDupeIssue[];
  issueOperations: TIssueOperations;
  disabled?: boolean;
  renderDeDupeActionModals?: boolean;
  isIntakeIssue?: boolean;
};

export const DeDupeIssuePopoverRoot = observer(function DeDupeIssuePopoverRoot(props: TDeDupeIssuePopoverRootProps) {
  const {} = props;
  return <></>;
});
