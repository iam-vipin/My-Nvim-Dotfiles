import type { FC } from "react";
import React from "react";
import { observer } from "mobx-react";
import useSWR from "swr";
// ui
import { useTranslation } from "@plane/i18n";
import { EmptyStateCompact } from "@plane/propel/empty-state";
// types
import type { TStateAnalytics } from "@plane/types";
// hooks
import { useProject } from "@/hooks/store/use-project";
// plane web
import { SectionWrapper } from "@/plane-web/components/common/layout/main/common/section-wrapper";
import { ProgressSection } from "@/plane-web/components/common/layout/main/sections/progress-root";
import projectService from "@/plane-web/services/project/project.service";

type Props = {
  workspaceSlug: string;
  projectId: string;
};

export const ProjectOverviewProgressSectionRoot = observer(function ProjectOverviewProgressSectionRoot(props: Props) {
  const { workspaceSlug, projectId } = props;
  // store hooks
  const { getProjectById } = useProject();
  const { t } = useTranslation();
  // derived values
  const project = getProjectById(projectId);

  const { data: analytics } = useSWR(
    project && workspaceSlug ? `PROJECT_ANALYTICS_${project?.id}` : null,
    project && workspaceSlug ? () => projectService.fetchProjectAnalytics(workspaceSlug, project?.id) : null,
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  if (!analytics) return null;

  const isEmpty = Object.values(analytics).every((value) => value === 0);

  if (isEmpty) {
    return (
      <SectionWrapper>
        <EmptyStateCompact
          assetKey="work-item"
          title={t("common_empty_state.progress.title")}
          description={t("common_empty_state.progress.description")}
        />
      </SectionWrapper>
    );
  }
  return <ProgressSection data={analytics} />;
});
