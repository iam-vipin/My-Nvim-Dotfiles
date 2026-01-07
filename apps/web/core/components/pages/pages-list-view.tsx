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
// types
import type { TPageNavigationTabs } from "@plane/types";
// components
import { PagesListHeaderRoot } from "@/components/pages/header";
// plane web hooks
import { EPageStoreType, usePageStore } from "@/plane-web/hooks/store";
import { ProjectPagesListRoot } from "./list";

const storeType = EPageStoreType.PROJECT;

type TPageView = {
  pageType: TPageNavigationTabs;
  projectId: string;
  workspaceSlug: string;
};

export const ProjectPagesListView = observer(function ProjectPagesListView(props: TPageView) {
  const { pageType, workspaceSlug, projectId } = props;
  // store hooks
  const { isAnyPageAvailable } = usePageStore(storeType);

  // pages loader
  return (
    <div className="relative w-full h-full overflow-hidden flex flex-col">
      {/* tab header */}
      {isAnyPageAvailable && (
        <PagesListHeaderRoot pageType={pageType} projectId={projectId} workspaceSlug={workspaceSlug} />
      )}
      <ProjectPagesListRoot pageType={pageType} workspaceSlug={workspaceSlug} projectId={projectId} />
    </div>
  );
});
