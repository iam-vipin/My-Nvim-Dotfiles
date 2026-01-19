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

import React, { useEffect, useState } from "react";
import { observer } from "mobx-react";
// plane imports
import type { IWorkspaceMemberInvitation } from "@plane/types";
import { ECreateOrJoinWorkspaceViews, EOnboardingSteps } from "@plane/types";
// hooks
import { useUser } from "@/hooks/store/user";
// local components
import { WorkspaceCreateStep, WorkspaceJoinInvitesStep } from "./";

type Props = {
  invitations: IWorkspaceMemberInvitation[];
  handleStepChange: (step: EOnboardingSteps, skipInvites?: boolean) => void;
};

export const WorkspaceSetupStep = observer(function WorkspaceSetupStep({ invitations, handleStepChange }: Props) {
  // states
  const [currentView, setCurrentView] = useState<ECreateOrJoinWorkspaceViews | null>(null);
  // store hooks
  const { data: user } = useUser();

  useEffect(() => {
    if (invitations.length > 0) {
      setCurrentView(ECreateOrJoinWorkspaceViews.WORKSPACE_JOIN);
    } else {
      setCurrentView(ECreateOrJoinWorkspaceViews.WORKSPACE_CREATE);
    }
  }, [invitations]);

  return (
    <>
      {currentView === ECreateOrJoinWorkspaceViews.WORKSPACE_JOIN ? (
        <WorkspaceJoinInvitesStep
          invitations={invitations}
          handleNextStep={async () => {
            handleStepChange(EOnboardingSteps.WORKSPACE_CREATE_OR_JOIN, true);
          }}
          handleCurrentViewChange={() => setCurrentView(ECreateOrJoinWorkspaceViews.WORKSPACE_CREATE)}
        />
      ) : (
        <WorkspaceCreateStep
          user={user}
          onComplete={(skipInvites) => handleStepChange(EOnboardingSteps.WORKSPACE_CREATE_OR_JOIN, skipInvites)}
          handleCurrentViewChange={() => setCurrentView(ECreateOrJoinWorkspaceViews.WORKSPACE_JOIN)}
          hasInvitations={invitations.length > 0}
        />
      )}
    </>
  );
});
