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

// plane imports
import { EProductSubscriptionTier } from "@plane/constants";
// ce components
import { useMemberColumns as useCeMemberColumns } from "@/ce/components/workspace/settings/useMemberColumns";
// components
import type { RowData } from "@/components/workspace/settings/member-columns";
// plane web hooks
import { useWorkspaceSubscription } from "@/plane-web/hooks/store";

export const useMemberColumns = () => {
  const { columns, workspaceSlug, removeMemberModal, setRemoveMemberModal } = useCeMemberColumns();
  const [fullName, display_name, email, accountType, authentication, joiningDate] = columns;
  const { currentWorkspaceSubscribedPlanDetail } = useWorkspaceSubscription();
  const eeColumns = [
    fullName,
    display_name,
    email,
    accountType,
    {
      key: "Billing Status",
      content: "Billing Status",
      tdRender: (rowData: RowData) => <div className="w-36">{rowData.is_active ? "Active" : "-"}</div>,
    },
    authentication,
    joiningDate,
  ];

  return currentWorkspaceSubscribedPlanDetail
    ? {
        columns:
          EProductSubscriptionTier[currentWorkspaceSubscribedPlanDetail.product] >= EProductSubscriptionTier.PRO
            ? eeColumns
            : columns,
        workspaceSlug,
        removeMemberModal,
        setRemoveMemberModal,
      }
    : {};
};
