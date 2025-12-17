import { observer } from "mobx-react";
import { useParams } from "next/navigation";
// icons
import { Sidebar } from "lucide-react";
// plane imports
import { OverviewIcon } from "@plane/propel/icons";
import { Breadcrumbs, Header } from "@plane/ui";
import { cn } from "@plane/utils";
// hooks
import { BreadcrumbLink } from "@/components/common/breadcrumb-link";
import { useAppTheme } from "@/hooks/store/use-app-theme";
import { useProject } from "@/hooks/store/use-project";
import { useAppRouter } from "@/hooks/use-app-router";
// plane web imports
import { CommonProjectBreadcrumbs } from "@/plane-web/components/breadcrumbs/common";

export const ProjectOverviewHeader = observer(function ProjectOverviewHeader() {
  // router
  const router = useAppRouter();
  const { workspaceSlug, projectId } = useParams();
  // store hooks
  const { currentProjectDetails, loader } = useProject();
  const { projectOverviewSidebarCollapsed, toggleProjectOverviewSidebar } = useAppTheme();

  return (
    <Header>
      <Header.LeftItem>
        <Breadcrumbs onBack={() => router.back()} isLoading={loader === "init-loader"}>
          <CommonProjectBreadcrumbs workspaceSlug={workspaceSlug?.toString()} projectId={projectId?.toString()} />
          <Breadcrumbs.Item
            component={
              <BreadcrumbLink
                label="Overview"
                href={`/${workspaceSlug}/projects/${currentProjectDetails?.id}/overview/`}
                icon={<OverviewIcon className="h-4 w-4 text-tertiary" />}
              />
            }
          />
        </Breadcrumbs>
      </Header.LeftItem>
      <Header.RightItem>
        <div className="flex items-center gap-2">
          <Sidebar
            className={cn("size-4 cursor-pointer", {
              "text-accent-primary": !projectOverviewSidebarCollapsed,
            })}
            onClick={() => toggleProjectOverviewSidebar()}
          />
        </div>
      </Header.RightItem>
    </Header>
  );
});
