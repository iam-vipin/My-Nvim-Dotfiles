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
import type { TIssueServiceType } from "@plane/types";
import { EIssueServiceType } from "@plane/types";
// local imports
import { IssueAttachmentItemList } from "../../attachment/attachment-item-list";
import { useAttachmentOperations } from "./helper";

type Props = {
  workspaceSlug: string;
  projectId: string;
  issueId: string;
  disabled: boolean;
  issueServiceType?: TIssueServiceType;
};

export const IssueAttachmentsCollapsibleContent = observer(function IssueAttachmentsCollapsibleContent(props: Props) {
  const { workspaceSlug, projectId, issueId, disabled, issueServiceType = EIssueServiceType.ISSUES } = props;
  // helper
  const attachmentHelpers = useAttachmentOperations(workspaceSlug, projectId, issueId, issueServiceType);
  return (
    <IssueAttachmentItemList
      workspaceSlug={workspaceSlug}
      projectId={projectId}
      issueId={issueId}
      disabled={disabled}
      attachmentHelpers={attachmentHelpers}
      issueServiceType={issueServiceType}
    />
  );
});
