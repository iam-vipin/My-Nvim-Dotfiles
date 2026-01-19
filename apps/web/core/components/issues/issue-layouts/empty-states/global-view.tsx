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
// plane imports
import { EUserPermissionsLevel } from "@plane/constants";
import { useTranslation } from "@plane/i18n";
import { EmptyStateDetailed } from "@plane/propel/empty-state";
import { EIssuesStoreType, EUserWorkspaceRoles } from "@plane/types";
// hooks
import { useCommandPalette } from "@/hooks/store/use-command-palette";
import { useProject } from "@/hooks/store/use-project";
import { useUserPermissions } from "@/hooks/store/user";

export const GlobalViewEmptyState = observer(function GlobalViewEmptyState() {
  // plane imports
  const { t } = useTranslation();
  // store hooks
  const { workspaceProjectIds } = useProject();
  const { toggleCreateIssueModal, toggleCreateProjectModal } = useCommandPalette();
  const { allowPermissions } = useUserPermissions();
  // derived values
  const hasMemberLevelPermission = allowPermissions(
    [EUserWorkspaceRoles.ADMIN, EUserWorkspaceRoles.MEMBER],
    EUserPermissionsLevel.WORKSPACE
  );

  if (workspaceProjectIds?.length === 0) {
    return (
      <EmptyStateDetailed
        title={t("workspace_projects.empty_state.no_projects.title")}
        description={t("workspace_projects.empty_state.no_projects.description")}
        assetKey="project"
        assetClassName="size-40"
        actions={[
          {
            label: t("workspace_projects.empty_state.no_projects.primary_button.text"),
            onClick: () => {
              toggleCreateProjectModal(true);
            },
            disabled: !hasMemberLevelPermission,
            variant: "primary",
          },
        ]}
      />
    );
  }

  return (
    <EmptyStateDetailed
      title={t(`workspace_empty_state.views.title`)}
      description={t(`workspace_empty_state.views.description`)}
      assetKey="project"
      assetClassName="size-40"
      actions={[
        {
          label: t(`workspace_empty_state.views.cta_primary`),
          onClick: () => {
            toggleCreateIssueModal(true, EIssuesStoreType.PROJECT);
          },
          disabled: !hasMemberLevelPermission,
          variant: "primary",
        },
      ]}
    />
  );
});
