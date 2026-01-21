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
import { observer } from "mobx-react";
// plane web components
import { ContentWrapper } from "@plane/ui";
import { ProjectBoardGroup } from "@/plane-web/components/projects/layouts/board/group";
// plane web hooks
import { useProjectFilter } from "@/plane-web/hooks/store";
import { EProjectLayouts } from "@/types/workspace-project-filters";
import { ProjectLayoutHOC } from "../project-layout-HOC";

export const ProjectBoardLayout = observer(function ProjectBoardLayout() {
  // hooks
  const { getFilteredProjectsByLayout } = useProjectFilter();

  const groupByProjectIds = getFilteredProjectsByLayout(EProjectLayouts.BOARD);

  return (
    <ProjectLayoutHOC layout={EProjectLayouts.BOARD}>
      <ContentWrapper className="!py-0">
        <ProjectBoardGroup groupByProjectIds={groupByProjectIds || {}} />
      </ContentWrapper>
    </ProjectLayoutHOC>
  );
});
