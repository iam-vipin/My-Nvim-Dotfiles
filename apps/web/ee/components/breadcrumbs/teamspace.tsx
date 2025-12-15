import type { FC } from "react";
import { observer } from "mobx-react";
import Link from "next/link";
// plane imports
import type { EProjectFeatureKey } from "@plane/constants";
// helpers
import { cn } from "@plane/utils";
// plane web hooks
import { useTeamspaces } from "@/plane-web/hooks/store";
// local components
import { ProjectFeatureBreadcrumb } from "./project-feature";

type TTeamspaceBreadcrumbProps = {
  workspaceSlug: string;
  teamspaceId: string;
  featureKey?: EProjectFeatureKey;
  isLast?: boolean;
};

export const TeamspaceBreadcrumb = observer(function TeamspaceBreadcrumb(props: TTeamspaceBreadcrumbProps) {
  const { workspaceSlug, teamspaceId, featureKey, isLast = false } = props;

  // store hooks
  const { getTeamspaceById } = useTeamspaces();

  // derived values
  const teamspace = getTeamspaceById(teamspaceId);
  const teamspaceName = teamspace?.name || teamspaceId;

  return (
    <>
      <Link
        href={`/${workspaceSlug}/teamspaces`}
        className={cn("text-body-xs-medium text-tertiary hover:text-secondary", {
          "pointer-events-none": isLast,
        })}
      >
        Teamspaces
      </Link>
      <span className="mx-2 text-tertiary">/</span>
      <Link
        href={`/${workspaceSlug}/teamspaces/${teamspaceId}`}
        className={cn("text-body-xs-medium text-tertiary hover:text-secondary", {
          "pointer-events-none": isLast && !featureKey,
        })}
      >
        {teamspaceName}
      </Link>
      {featureKey && (
        <>
          <span className="mx-2 text-tertiary">/</span>
          <ProjectFeatureBreadcrumb
            workspaceSlug={workspaceSlug}
            projectId={teamspaceId}
            featureKey={featureKey}
            isLast={isLast}
          />
        </>
      )}
    </>
  );
});
