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
// plane web imports
import { useProjectFilter } from "@/plane-web/hooks/store/workspace-project-states";
import { EProjectLayouts } from "@/types/workspace-project-filters";
// local imports
import { ProjectBoardLayout } from "./board";
import { BaseProjectRoot } from "./gallery/base-gallery-root";
import { BaseTimelineRoot } from "./timeline/base-timeline-root";
import { BaseListRoot } from "./list/base-list-root";

export const ProjectLayoutRoot = observer(function ProjectLayoutRoot() {
  const { filters } = useProjectFilter();

  // derived values
  const currentLayout = filters?.layout;

  function ProjectLayout(props: { activeLayout: EProjectLayouts | undefined }) {
    switch (props.activeLayout) {
      case EProjectLayouts.BOARD:
        return <ProjectBoardLayout />;
      case EProjectLayouts.TIMELINE:
        return <BaseTimelineRoot />;
      case EProjectLayouts.GALLERY:
        return <BaseProjectRoot />;
      case EProjectLayouts.TABLE:
        return <BaseListRoot />;
      default:
        return <></>;
    }
  }

  return <ProjectLayout activeLayout={currentLayout} />;
});
