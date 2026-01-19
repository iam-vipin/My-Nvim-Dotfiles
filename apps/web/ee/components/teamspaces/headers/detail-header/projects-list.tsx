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
import { TEAMSPACE_TRACKER_ELEMENTS } from "@plane/constants";
// plane constants
// components
import { Button } from "@plane/propel/button";
// hooks
// plane web imports
import { UpdateTeamspaceProjectsButton } from "@/plane-web/components/teamspaces/actions/projects/button";

type TeamspaceProjectListHeaderActionsProps = {
  teamspaceId: string;
  isEditingAllowed: boolean;
};

export const TeamspaceProjectListHeaderActions = observer(function TeamspaceProjectListHeaderActions(
  props: TeamspaceProjectListHeaderActionsProps
) {
  const { teamspaceId, isEditingAllowed } = props;
  // router
  const { workspaceSlug } = useParams();

  if (!workspaceSlug) return;

  return (
    <>
      {isEditingAllowed ? (
        <UpdateTeamspaceProjectsButton
          teamspaceId={teamspaceId}
          isEditingAllowed={isEditingAllowed}
          trackerElement={TEAMSPACE_TRACKER_ELEMENTS.HEADER_UPDATE_PROJECT_BUTTON}
          renderButton={({ open, trackerElement }) => (
            <Button onClick={open} data-ph-element={trackerElement} size="lg">
              <div className="hidden sm:block">Update</div> projects
            </Button>
          )}
        />
      ) : (
        <></>
      )}
    </>
  );
});
