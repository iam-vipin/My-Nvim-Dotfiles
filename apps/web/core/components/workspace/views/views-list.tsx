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
import useSWR from "swr";
// components
import { ViewListLoader } from "@/components/ui/loader/view-list-loader";
// hooks
import { useGlobalView } from "@/hooks/store/use-global-view";
// local imports
import { GlobalViewListItem } from "./view-list-item";

type Props = {
  searchQuery: string;
};

export const GlobalViewsList = observer(function GlobalViewsList(props: Props) {
  const { searchQuery } = props;
  // router
  const { workspaceSlug } = useParams();
  // store hooks
  const { fetchAllGlobalViews, currentWorkspaceViews, getSearchedViews } = useGlobalView();

  useSWR(
    workspaceSlug ? `GLOBAL_VIEWS_LIST_${workspaceSlug.toString()}` : null,
    workspaceSlug ? () => fetchAllGlobalViews(workspaceSlug.toString()) : null
  );

  if (!currentWorkspaceViews) return <ViewListLoader />;

  const filteredViewsList = getSearchedViews(searchQuery);

  return (
    <>
      {filteredViewsList?.map((viewId) => (
        <GlobalViewListItem key={viewId} viewId={viewId} />
      ))}
    </>
  );
});
