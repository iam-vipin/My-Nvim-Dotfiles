import { observer } from "mobx-react";
import useSWR from "swr";
// ui
import { Tabs, Loader } from "@plane/ui";
// plane web components
import { CyclePeekOverview } from "@/components/cycles/cycle-peek-overview";
import { TeamCompletedCyclesRoot } from "@/plane-web/components/teamspaces/cycles/completed";
import { TeamCurrentCyclesRoot } from "@/plane-web/components/teamspaces/cycles/current";
import { TeamUpcomingCyclesRoot } from "@/plane-web/components/teamspaces/cycles/upcoming";
// plane web hooks
import { useTeamspaceCycles } from "@/plane-web/hooks/store";
import type { Route } from "./+types/page";

function TeamspaceCyclesLoader({ height }: { height: string }) {
  return Array.from({ length: 3 }).map((_, index) => (
    <Loader className="px-5 pt-5 last:pb-5" key={index}>
      <Loader.Item height={height} width="100%" />
    </Loader>
  ));
}

function TeamspaceCyclesPage({ params }: Route.ComponentProps) {
  const { workspaceSlug, teamspaceId } = params;
  // store hooks
  const { getTeamspaceCyclesLoader, fetchTeamspaceCycles } = useTeamspaceCycles();
  // derived values
  const teamspaceCyclesLoader = getTeamspaceCyclesLoader(teamspaceId);
  const isTeamspaceCyclesLoading = teamspaceCyclesLoader === "init-loader";
  // fetch teamspace cycles
  useSWR(["teamspaceCycles", workspaceSlug, teamspaceId], () => fetchTeamspaceCycles(workspaceSlug, teamspaceId), {
    revalidateOnFocus: false,
    revalidateIfStale: false,
  });

  const TEAM_CYCLES_TABS = [
    {
      key: "current",
      label: "Current",
      content: isTeamspaceCyclesLoading ? (
        <TeamspaceCyclesLoader height="256px" />
      ) : (
        <TeamCurrentCyclesRoot teamspaceId={teamspaceId} workspaceSlug={workspaceSlug} />
      ),
    },
    {
      key: "upcoming",
      label: "Upcoming",
      content: isTeamspaceCyclesLoading ? (
        <TeamspaceCyclesLoader height="98px" />
      ) : (
        <TeamUpcomingCyclesRoot teamspaceId={teamspaceId} workspaceSlug={workspaceSlug} />
      ),
    },
    {
      key: "completed",
      label: "Completed",
      content: isTeamspaceCyclesLoading ? (
        <TeamspaceCyclesLoader height="98px" />
      ) : (
        <TeamCompletedCyclesRoot teamspaceId={teamspaceId} workspaceSlug={workspaceSlug} />
      ),
    },
  ];

  return (
    <div className="flex w-full h-full">
      <Tabs
        tabs={TEAM_CYCLES_TABS}
        storageKey={`teamspace-cycles-${teamspaceId}`}
        defaultTab="current"
        size="sm"
        tabListContainerClassName="px-6 py-2 border-b border-subtle-1 divide-x divide-subtle-1"
        tabListClassName="my-2 max-w-64"
        tabPanelClassName="h-full w-full overflow-hidden overflow-y-auto"
      />
      <CyclePeekOverview workspaceSlug={workspaceSlug} isArchived={false} />
    </div>
  );
}

export default observer(TeamspaceCyclesPage);
