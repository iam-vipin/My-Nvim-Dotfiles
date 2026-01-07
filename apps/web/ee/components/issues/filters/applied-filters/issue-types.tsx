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
import { useParams } from "next/navigation";
import { CloseIcon } from "@plane/propel/icons";
// plane web components
import { IssueTypeLogo } from "@/plane-web/components/issue-types/common/issue-type-logo";
// plane web hooks
import { useIssueTypes } from "@/plane-web/hooks/store";

type Props = {
  handleRemove: (val: string) => void;
  values: string[];
  editable: boolean | undefined;
};

export const AppliedIssueTypeFilters = observer(function AppliedIssueTypeFilters(props: Props) {
  const { handleRemove, values, editable } = props;
  // router
  const { workspaceSlug, projectId } = useParams();
  // store hooks
  const { isWorkItemTypeEnabledForProject, getIssueTypeById } = useIssueTypes();
  // derived values
  const isWorkItemTypeEnabled = isWorkItemTypeEnabledForProject(workspaceSlug?.toString(), projectId?.toString());

  // Return null if issue type is not enabled for the project
  if (!isWorkItemTypeEnabled) return null;

  return (
    <>
      {values.map((issueTypeId) => {
        const issueType = getIssueTypeById(issueTypeId);
        if (!issueType) return null;
        return (
          <div key={issueTypeId} className="flex items-center gap-1 rounded-sm bg-layer-1 p-1 text-11 truncate">
            <IssueTypeLogo icon_props={issueType?.logo_props?.icon} isDefault={issueType?.is_default} />
            <span className="normal-case truncate">{issueType.name}</span>
            {editable && (
              <button
                type="button"
                className="grid place-items-center text-tertiary hover:text-secondary"
                onClick={() => handleRemove(issueTypeId)}
              >
                <CloseIcon height={10} width={10} strokeWidth={2} />
              </button>
            )}
          </div>
        );
      })}
    </>
  );
});
