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
import type { TPageNavigationTabs } from "@plane/types";
// plane web hooks
import { EPageStoreType } from "@/plane-web/hooks/store";
// local imports
import { PageTabNavigation } from "../list/tab-navigation";
import { BasePagesListHeaderRoot } from "./base";

type Props = {
  pageType: TPageNavigationTabs;
  projectId: string;
  workspaceSlug: string;
};

export const PagesListHeaderRoot = observer(function PagesListHeaderRoot(props: Props) {
  const { pageType, projectId, workspaceSlug } = props;

  return (
    <BasePagesListHeaderRoot
      storeType={EPageStoreType.PROJECT}
      tabNavigationComponent={
        <PageTabNavigation workspaceSlug={workspaceSlug} projectId={projectId} pageType={pageType} />
      }
    />
  );
});
