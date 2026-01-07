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
// ce components
import type { TProjectLevelModalsProps } from "@/ce/components/command-palette/modals/project-level";
import { ProjectLevelModals as BaseProjectLevelModals } from "@/ce/components/command-palette/modals/project-level";
import { CreateUpdateAutomationModal } from "@/plane-web/components/automations/modals/create-update-modal";
import { useAutomations } from "@/plane-web/hooks/store/automations/use-automations";

export const ProjectLevelModals = observer(function ProjectLevelModals(props: TProjectLevelModalsProps) {
  // store hooks
  const {
    projectAutomations: { createUpdateModalConfig, setCreateUpdateModalConfig },
  } = useAutomations();

  return (
    <>
      <BaseProjectLevelModals {...props} />
      <CreateUpdateAutomationModal
        isOpen={createUpdateModalConfig.isOpen}
        data={createUpdateModalConfig.payload ?? undefined}
        onClose={() => setCreateUpdateModalConfig({ isOpen: false, payload: null })}
      />
    </>
  );
});
