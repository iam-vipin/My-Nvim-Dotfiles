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
// plane imports
import { ISSUE_DISPLAY_FILTERS_BY_PAGE } from "@plane/constants";
import { EIssuesStoreType, EIssueLayoutTypes } from "@plane/types";
import { Spinner } from "@plane/ui";
// components
import { CalendarLayout } from "@/components/issues/issue-layouts/calendar/roots/project-root";
import { KanBanLayout } from "@/components/issues/issue-layouts/kanban/roots/project-root";
import { ListLayout } from "@/components/issues/issue-layouts/list/roots/project-root";
import { ProjectSpreadsheetLayout } from "@/components/issues/issue-layouts/spreadsheet/roots/project-root";
import { IssuePeekOverview } from "@/components/issues/peek-overview";
// hooks
import { WorkItemFiltersRow } from "@/components/work-item-filters/filters-row";
import { useIssues } from "@/hooks/store/use-issues";
import { IssuesStoreContext } from "@/hooks/use-issue-layout-store";
import { useWorkspaceIssueProperties } from "@/hooks/use-workspace-issue-properties";
// plane web imports
import { TeamspaceLevelWorkItemFiltersHOC } from "@/components/work-item-filters/filters-hoc/teamspace-level";

function TeamspaceWorkItemLayout({ activeLayout }: { activeLayout: EIssueLayoutTypes | undefined }) {
  switch (activeLayout) {
    case EIssueLayoutTypes.LIST:
      return <ListLayout />;
    case EIssueLayoutTypes.KANBAN:
      return <KanBanLayout />;
    case EIssueLayoutTypes.CALENDAR:
      return <CalendarLayout />;
    case EIssueLayoutTypes.SPREADSHEET:
      return <ProjectSpreadsheetLayout />;
    default:
      return null;
  }
}

const TeamspaceWorkItemLayoutContent = observer(function TeamspaceWorkItemLayoutContent({
  issueLoader,
  teamspaceId,
}: {
  issueLoader: string | undefined;
  teamspaceId: string;
}) {
  // store hooks
  const { issuesFilter } = useIssues(EIssuesStoreType.TEAM);
  // derived values
  const issueFilters = issuesFilter?.getIssueFilters(teamspaceId);
  const activeLayout = issueFilters?.displayFilters?.layout;

  return (
    <div className="relative h-full w-full overflow-auto bg-layer-2">
      {issueLoader === "mutation" && (
        <div className="fixed w-[40px] h-[40px] z-50 right-[20px] top-[70px] flex justify-center items-center bg-layer-1 shadow-sm rounded">
          <Spinner className="w-4 h-4" />
        </div>
      )}
      <TeamspaceWorkItemLayout activeLayout={activeLayout} />
    </div>
  );
});

export const TeamspaceLayoutRoot = observer(function TeamspaceLayoutRoot() {
  // router
  const { workspaceSlug: routerWorkspaceSlug, teamspaceId: routerTeamspaceId } = useParams();
  const workspaceSlug = routerWorkspaceSlug ? routerWorkspaceSlug.toString() : undefined;
  const teamspaceId = routerTeamspaceId ? routerTeamspaceId.toString() : undefined;
  // store hooks
  const { issues, issuesFilter } = useIssues(EIssuesStoreType.TEAM);
  // derived values
  const issueLoader = issues?.getIssueLoader();
  const workItemFilters = teamspaceId ? issuesFilter?.getIssueFilters(teamspaceId) : undefined;
  // fetch all issue properties
  useWorkspaceIssueProperties(workspaceSlug);
  // fetch teamspace issue filters
  useSWR(
    workspaceSlug && teamspaceId ? `TEAMSPACE_ISSUE_FILTERS_${workspaceSlug}_${teamspaceId}` : null,
    async () => {
      if (workspaceSlug && teamspaceId) {
        await issuesFilter?.fetchFilters(workspaceSlug, teamspaceId);
      }
    },
    { revalidateIfStale: false, revalidateOnFocus: false }
  );

  if (!workspaceSlug || !teamspaceId || !issuesFilter?.getIssueFilters(teamspaceId)) return <></>;
  return (
    <IssuesStoreContext.Provider value={EIssuesStoreType.TEAM}>
      <TeamspaceLevelWorkItemFiltersHOC
        enableSaveView
        entityType={EIssuesStoreType.TEAM}
        entityId={teamspaceId}
        filtersToShowByLayout={ISSUE_DISPLAY_FILTERS_BY_PAGE.team_issues.filters}
        initialWorkItemFilters={workItemFilters}
        updateFilters={issuesFilter?.updateFilterExpression.bind(issuesFilter, workspaceSlug, teamspaceId)}
        teamspaceId={teamspaceId}
        workspaceSlug={workspaceSlug}
      >
        {({ filter: teamspaceWorkItemsFilter }) => (
          <div className="relative flex h-full w-full flex-col overflow-hidden">
            {teamspaceWorkItemsFilter && <WorkItemFiltersRow filter={teamspaceWorkItemsFilter} />}
            <TeamspaceWorkItemLayoutContent issueLoader={issueLoader} teamspaceId={teamspaceId} />
            <IssuePeekOverview />
          </div>
        )}
      </TeamspaceLevelWorkItemFiltersHOC>
    </IssuesStoreContext.Provider>
  );
});
