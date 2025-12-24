import type { FC } from "react";
import { Fragment } from "react";
import { observer } from "mobx-react";
import Link from "next/link";
import { useTheme } from "next-themes";
import useSWR from "swr";
// icons
import { CalendarCheck } from "lucide-react";
// headless ui
import { Tab } from "@headlessui/react";
// plane constants
// types
import { useTranslation } from "@plane/i18n";
import { PriorityIcon } from "@plane/propel/icons";
import { Tooltip } from "@plane/propel/tooltip";
import type { IActiveCycle } from "@plane/types";
import { EIssuesStoreType } from "@plane/types";
// ui
import { Avatar, Loader } from "@plane/ui";
// components
import {
  cn,
  generateWorkItemLink,
  getFileURL,
  renderFormattedDate,
  renderFormattedDateWithoutYear,
} from "@plane/utils";
// assets
import assigneeDark from "@/app/assets/empty-state/active-cycle/assignee-dark.webp?url";
import assigneeLight from "@/app/assets/empty-state/active-cycle/assignee-light.webp?url";
import labelDark from "@/app/assets/empty-state/active-cycle/label-dark.webp?url";
import labelLight from "@/app/assets/empty-state/active-cycle/label-light.webp?url";
import priorityDark from "@/app/assets/empty-state/active-cycle/priority-dark.webp?url";
import priorityLight from "@/app/assets/empty-state/active-cycle/priority-light.webp?url";
import userPlaceholder from "@/app/assets/user.png?url";
import { SingleProgressStats } from "@/components/core/sidebar/single-progress-stats";
import { StateDropdown } from "@/components/dropdowns/state/dropdown";
import { SimpleEmptyState } from "@/components/empty-state/simple-empty-state-root";
// constants
import { CYCLE_ISSUES_WITH_PARAMS } from "@/constants/fetch-keys";
// helpers
// hooks
import { useIssues } from "@/hooks/store/use-issues";
import { useProject } from "@/hooks/store/use-project";
import { useProjectState } from "@/hooks/store/use-project-state";
import useLocalStorage from "@/hooks/use-local-storage";

export type ActiveCycleStatsProps = {
  workspaceSlug: string;
  projectId: string;
  cycle: IActiveCycle;
};

export const ActiveCycleStats = observer(function ActiveCycleStats(props: ActiveCycleStatsProps) {
  const { workspaceSlug, projectId, cycle } = props;
  // plane hooks
  const { t } = useTranslation();
  // theme hook
  const { resolvedTheme } = useTheme();
  // hooks
  const { storedValue: tab, setValue: setTab } = useLocalStorage("activeCycleTab", "Assignees");
  // derived values
  const priorityResolvedPath = resolvedTheme === "light" ? priorityLight : priorityDark;
  const assigneesResolvedPath = resolvedTheme === "light" ? assigneeLight : assigneeDark;
  const labelsResolvedPath = resolvedTheme === "light" ? labelLight : labelDark;

  const currentValue = (tab: string | null) => {
    switch (tab) {
      case "Priority-Issues":
        return 0;
      case "Assignees":
        return 1;
      case "Labels":
        return 2;
      default:
        return 0;
    }
  };
  const {
    issues: { fetchActiveCycleIssues },
  } = useIssues(EIssuesStoreType.CYCLE);
  const { fetchWorkspaceStates } = useProjectState();
  const { getProjectIdentifierById } = useProject();

  // derived values
  const projectIdentifier = getProjectIdentifierById(projectId);

  const { data: activeCycleIssues } = useSWR(
    workspaceSlug && projectId && cycle.id ? CYCLE_ISSUES_WITH_PARAMS(cycle.id, { priority: "urgent,high" }) : null,
    workspaceSlug && projectId && cycle.id ? () => fetchActiveCycleIssues(workspaceSlug, projectId, 10, cycle.id) : null
  );

  useSWR(
    workspaceSlug ? `WORKSPACE_STATES_${workspaceSlug}` : null,
    workspaceSlug ? () => fetchWorkspaceStates(workspaceSlug.toString()) : null
  );

  const cycleIssues = activeCycleIssues;

  return (
    <div className="flex flex-col gap-4 p-4 min-h-[17rem] overflow-hidden col-span-1 lg:col-span-2 xl:col-span-1 border border-subtle-1 rounded-lg">
      <Tab.Group
        as={Fragment}
        defaultIndex={currentValue(tab)}
        onChange={(i) => {
          switch (i) {
            case 0:
              return setTab("Priority-Issues");
            case 1:
              return setTab("Assignees");
            case 2:
              return setTab("Labels");

            default:
              return setTab("Priority-Issues");
          }
        }}
      >
        <Tab.List
          as="div"
          className="relative border-[0.5px] border-subtle-1 rounded-sm bg-layer-1 p-[1px] grid"
          style={{
            gridTemplateColumns: `repeat(3, 1fr)`,
          }}
        >
          <Tab
            className={({ selected }) =>
              cn(
                "relative z-[1] font-semibold text-11 rounded-[3px] py-1.5 text-placeholder focus:outline-none transition duration-500",
                {
                  "text-tertiary bg-surface-1": selected,
                  "hover:text-tertiary": !selected,
                }
              )
            }
          >
            Priority Work items
          </Tab>
          <Tab
            className={({ selected }) =>
              cn(
                "relative z-[1] font-semibold text-11 rounded-[3px] py-1.5 text-placeholder focus:outline-none transition duration-500",
                {
                  "text-tertiary bg-surface-1": selected,
                  "hover:text-tertiary": !selected,
                }
              )
            }
          >
            Assignees
          </Tab>
          <Tab
            className={({ selected }) =>
              cn(
                "relative z-[1] font-semibold text-11 rounded-[3px] py-1.5 text-placeholder focus:outline-none transition duration-500",
                {
                  "text-tertiary bg-surface-1": selected,
                  "hover:text-tertiary": !selected,
                }
              )
            }
          >
            Labels
          </Tab>
        </Tab.List>

        <Tab.Panels as={Fragment}>
          <Tab.Panel
            as="div"
            className="flex h-52 w-full flex-col gap-1 overflow-y-auto  text-secondary vertical-scrollbar scrollbar-sm"
          >
            <div className="flex flex-col gap-1 h-full w-full overflow-y-auto vertical-scrollbar scrollbar-sm">
              {cycleIssues ? (
                cycleIssues?.count > 0 && Array.isArray(cycleIssues.results) ? (
                  cycleIssues.results.map((issue: any) => (
                    <Link
                      key={issue.id}
                      href={generateWorkItemLink({
                        workspaceSlug,
                        projectId: issue?.project_id,
                        issueId: issue?.id,
                        projectIdentifier,
                        sequenceId: issue?.sequence_id,
                      })}
                      className="group flex cursor-pointer items-center justify-between gap-2 rounded-md hover:bg-layer-1 p-1"
                    >
                      <div className="flex items-center gap-1.5 flex-grow w-full min-w-24 truncate">
                        <PriorityIcon priority={issue.priority} withContainer size={12} />

                        <Tooltip
                          tooltipHeading="Work item ID"
                          tooltipContent={`${cycle.project_detail?.identifier}-${issue.sequence_id}`}
                        >
                          <span className="flex-shrink-0 text-11 text-secondary">
                            {cycle.project_detail?.identifier}-{issue.sequence_id}
                          </span>
                        </Tooltip>
                        <Tooltip position="top-start" tooltipHeading="Title" tooltipContent={issue.name}>
                          <span className="text-[0.825rem] text-primary truncate">{issue.name}</span>
                        </Tooltip>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <StateDropdown
                          value={issue.state_id ?? undefined}
                          onChange={() => {}}
                          projectId={projectId?.toString() ?? ""}
                          disabled
                          buttonVariant="background-with-text"
                          buttonContainerClassName="cursor-pointer max-w-24"
                          showTooltip
                        />
                        {issue.target_date && (
                          <Tooltip tooltipHeading="Target Date" tooltipContent={renderFormattedDate(issue.target_date)}>
                            <div className="h-full flex truncate items-center gap-1.5 rounded-sm text-11 px-2 py-0.5 bg-layer-1 group-hover:bg-surface-1 cursor-pointer">
                              <CalendarCheck className="h-3 w-3 flex-shrink-0" />
                              <span className="text-11 truncate">
                                {renderFormattedDateWithoutYear(issue.target_date)}
                              </span>
                            </div>
                          </Tooltip>
                        )}
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="flex items-center justify-center h-full w-full">
                    <SimpleEmptyState
                      title={t("active_cycle_analytics.empty_state.priority.title")}
                      assetPath={priorityResolvedPath}
                    />
                  </div>
                )
              ) : (
                <Loader className="space-y-3">
                  <Loader.Item height="50px" />
                  <Loader.Item height="50px" />
                  <Loader.Item height="50px" />
                </Loader>
              )}
            </div>
          </Tab.Panel>

          <Tab.Panel
            as="div"
            className="flex h-52 w-full flex-col gap-1 overflow-y-auto text-secondary vertical-scrollbar scrollbar-sm"
          >
            {cycle?.distribution?.assignees && cycle.distribution.assignees.length > 0 ? (
              cycle.distribution.assignees.map((assignee, index) => {
                if (assignee.assignee_id)
                  return (
                    <SingleProgressStats
                      key={assignee.assignee_id}
                      title={
                        <div className="flex items-center gap-2">
                          <Avatar
                            name={assignee?.display_name ?? undefined}
                            src={getFileURL(assignee?.avatar_url ?? "")}
                          />

                          <span>{assignee.display_name}</span>
                        </div>
                      }
                      completed={assignee.completed_issues}
                      total={assignee.total_issues}
                    />
                  );
                else
                  return (
                    <SingleProgressStats
                      key={`unassigned-${index}`}
                      title={
                        <div className="flex items-center gap-2">
                          <div className="h-5 w-5 rounded-full border-2 border-subtle-1 bg-layer-1">
                            <img src={userPlaceholder} height="100%" width="100%" className="rounded-full" alt="User" />
                          </div>
                          <span>No assignee</span>
                        </div>
                      }
                      completed={assignee.completed_issues}
                      total={assignee.total_issues}
                    />
                  );
              })
            ) : (
              <div className="flex items-center justify-center h-full w-full">
                <SimpleEmptyState
                  title={t("active_cycle_analytics.empty_state.assignee.title")}
                  assetPath={assigneesResolvedPath}
                />
              </div>
            )}
          </Tab.Panel>

          <Tab.Panel
            as="div"
            className="flex h-52 w-full flex-col gap-1 overflow-y-auto  text-secondary vertical-scrollbar scrollbar-sm"
          >
            {cycle?.distribution?.labels && cycle.distribution.labels.length > 0 ? (
              cycle.distribution.labels.map((label, index) => (
                <SingleProgressStats
                  key={label.label_id ?? `no-label-${index}`}
                  title={
                    <div className="flex items-center gap-2">
                      <span
                        className="block h-3 w-3 rounded-full"
                        style={{
                          backgroundColor: label.color ?? "#000000",
                        }}
                      />
                      <span className="text-11">{label.label_name ?? "No labels"}</span>
                    </div>
                  }
                  completed={label.completed_issues}
                  total={label.total_issues}
                />
              ))
            ) : (
              <div className="flex items-center justify-center h-full w-full">
                <SimpleEmptyState
                  title={t("active_cycle_analytics.empty_state.label.title")}
                  assetPath={labelsResolvedPath}
                />
              </div>
            )}
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
});
