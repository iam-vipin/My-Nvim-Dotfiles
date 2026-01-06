import { observer } from "mobx-react";
import useSWR from "swr";
// ui
import { Tabs } from "@plane/propel/tabs";
import { Loader } from "@plane/ui";
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
      <Tabs defaultValue={TEAM_CYCLES_TABS[0].key}>
        <div className="flex items-center px-6 py-3 border-b border-custom-border-200 divide-x divide-subtle-1">
          <Tabs.List>
            {TEAM_CYCLES_TABS.map((tab) => (
              <Tabs.Trigger key={tab.key} value={tab.key}>
                {tab.label}
              </Tabs.Trigger>
            ))}
          </Tabs.List>
        </div>
        <div className="mt-4">
          {TEAM_CYCLES_TABS.map((tab) => (
            <Tabs.Content key={tab.key} value={tab.key}>
              {tab.content}
            </Tabs.Content>
          ))}
        </div>
      </Tabs>
      <CyclePeekOverview workspaceSlug={workspaceSlug} isArchived={false} />
    </div>
  );
}

export default observer(TeamspaceCyclesPage);
