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
import { E_FEATURE_FLAGS } from "@plane/constants";
import { useTranslation } from "@plane/i18n";
import { Button } from "@plane/propel/button";
// plane web hooks
import { useFlag } from "@/plane-web/hooks/store";
import { useProjectMembersActivity } from "@/plane-web/hooks/store/projects/use-project-members-activity";

type TProjectMembersActivityButtonProps = { workspaceSlug: string; projectId: string };

export const ProjectMembersActivityButton = observer(function ProjectMembersActivityButton(
  props: TProjectMembersActivityButtonProps
) {
  const { workspaceSlug, projectId } = props;
  // store hooks
  const isProjectMembersActivityEnabled = useFlag(workspaceSlug, E_FEATURE_FLAGS.PROJECT_MEMBER_ACTIVITY);
  const { toggleProjectMembersActivitySidebar } = useProjectMembersActivity();
  const { t } = useTranslation();

  return (
    <>
      {isProjectMembersActivityEnabled && (
        <Button variant="secondary" size="lg" onClick={() => toggleProjectMembersActivitySidebar(projectId, true)}>
          {t("activity")}
        </Button>
      )}
    </>
  );
});
