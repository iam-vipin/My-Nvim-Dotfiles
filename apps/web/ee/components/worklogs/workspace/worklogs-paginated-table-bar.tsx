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
import { PaginationBar } from "@/plane-web/components/common/pagination-bar";
// hooks
import { useWorkspaceWorklogs } from "@/plane-web/hooks/store";

type TWorkspaceTablePaginationBar = {
  workspaceSlug: string;
};

export const WorkspaceTablePaginationBar = observer(function WorkspaceTablePaginationBar(
  props: TWorkspaceTablePaginationBar
) {
  const { workspaceSlug } = props;
  // hooks
  const { perPage, paginationInfo, getPreviousWorklogs, getNextWorklogs } = useWorkspaceWorklogs();

  const getPrevDownloads = async () => {
    try {
      if (!workspaceSlug) return;
      await getPreviousWorklogs(workspaceSlug);
    } catch (error) {
      console.error("Error while showing prev worklogs", error);
    }
  };

  const getNextDownloads = async () => {
    try {
      if (!workspaceSlug) return;
      await getNextWorklogs(workspaceSlug);
    } catch (error) {
      console.error("Error while showing next worklogs", error);
    }
  };

  if (!paginationInfo) return <></>;
  return (
    <PaginationBar
      perPage={perPage}
      paginationInfo={paginationInfo}
      onPrevClick={getPrevDownloads}
      onNextClick={getNextDownloads}
    />
  );
});
