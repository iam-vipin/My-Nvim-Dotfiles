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
//
import { getButtonStyling } from "@plane/propel/button";
import { ProjectIcon } from "@plane/propel/icons";
import { cn } from "@plane/utils";
import { SectionEmptyState } from "@/plane-web/components/common/layout/main/common/empty-state";
import { ProjectList } from "./project-list";

type Props = {
  workspaceSlug: string;
  initiativeId: string;
  projectIds: string[] | null | undefined;
  disabled: boolean;
  toggleProjectModal: (value?: boolean) => void;
};

export function InitiativeProjectsCollapsibleContent(props: Props) {
  const { workspaceSlug, initiativeId, projectIds, disabled, toggleProjectModal } = props;
  return (
    <div className="mt-3">
      {projectIds && projectIds?.length > 0 ? (
        <ProjectList
          workspaceSlug={workspaceSlug}
          initiativeId={initiativeId}
          projectIds={projectIds}
          disabled={disabled}
        />
      ) : (
        <>
          <SectionEmptyState
            heading="No projects yet"
            subHeading="Start adding projects to manage and track the progress."
            icon={<ProjectIcon className="size-4" />}
            actionElement={
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  toggleProjectModal(true);
                }}
                disabled={disabled}
              >
                <span className={cn(getButtonStyling("secondary", "base"), "font-medium px-2 py-1")}>Add projects</span>
              </button>
            }
          />
        </>
      )}
    </div>
  );
}
