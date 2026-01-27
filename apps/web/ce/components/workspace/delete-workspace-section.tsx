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

import { useState } from "react";
import { observer } from "mobx-react";
// plane imports
import { WORKSPACE_TRACKER_ELEMENTS } from "@plane/constants";
import { useTranslation } from "@plane/i18n";
import { Button } from "@plane/propel/button";
import type { IWorkspace } from "@plane/types";
// components
import { SettingsBoxedControlItem } from "@/components/settings/boxed-control-item";
// local imports
import { DeleteWorkspaceModal } from "./delete-workspace-modal";

type TDeleteWorkspace = {
  workspace: IWorkspace | null;
};

export const DeleteWorkspaceSection = observer(function DeleteWorkspaceSection(props: TDeleteWorkspace) {
  const { workspace } = props;
  // states
  const [deleteWorkspaceModal, setDeleteWorkspaceModal] = useState(false);
  // translation
  const { t } = useTranslation();

  return (
    <>
      <DeleteWorkspaceModal
        data={workspace}
        isOpen={deleteWorkspaceModal}
        onClose={() => setDeleteWorkspaceModal(false)}
      />
      <SettingsBoxedControlItem
        title={t("workspace_settings.settings.general.delete_workspace")}
        description={t("workspace_settings.settings.general.delete_workspace_description")}
        control={
          <Button
            variant="error-outline"
            onClick={() => setDeleteWorkspaceModal(true)}
            data-ph-element={WORKSPACE_TRACKER_ELEMENTS.DELETE_WORKSPACE_BUTTON}
          >
            {t("delete")}
          </Button>
        }
      />
    </>
  );
});
