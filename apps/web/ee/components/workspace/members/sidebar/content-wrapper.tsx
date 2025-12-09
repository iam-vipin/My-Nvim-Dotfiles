"use client";

import type { ReactNode } from "react";
import { observer } from "mobx-react";
import { ArrowDownWideNarrow, ArrowUpWideNarrow, X, Loader as Spinner } from "lucide-react";
// plane imports
import { E_SORT_ORDER } from "@plane/constants";
import { Loader } from "@plane/ui";
import { cn } from "@plane/utils";
// plane web services
import { useWorkspaceMembersActivity } from "@/plane-web/hooks/store/use-workspace-members-activity";

type TSidebarContentWrapperProps = { children: ReactNode; workspaceSlug: string };

export const SidebarContentWrapper = observer(function SidebarContentWrapper(props: TSidebarContentWrapperProps) {
  const { children, workspaceSlug } = props;
  // store hooks
  const {
    getWorkspaceMembersActivitySidebarOpen,
    getWorkspaceMembersActivityLoader,
    getWorkspaceMembersActivitySortOrder,
    toggleWorkspaceMembersActivitySortOrder,
    toggleWorkspaceMembersActivitySidebar,
  } = useWorkspaceMembersActivity();
  // derived values
  const workspaceMembersActivityLoader = getWorkspaceMembersActivityLoader(workspaceSlug);
  const workspaceMembersActivitySortOrder = getWorkspaceMembersActivitySortOrder();
  const isSidebarOpen = getWorkspaceMembersActivitySidebarOpen(workspaceSlug);

  return (
    <div
      className={cn(
        "flex overflow-y-scroll absolute right-0 flex-col pt-4 pb-10 h-full border-l ease-linear border-custom-border-200 bg-custom-sidebar-background-100 xl:relative transition-[width] md:pt-page-y",
        {
          "hidden w-0": !isSidebarOpen,
          "sm:min-w-[368px] max-w-[368px]": isSidebarOpen,
        }
      )}
      aria-hidden={!isSidebarOpen}
    >
      <div className="flex gap-2 justify-between items-center px-7 pb-5">
        <h5 className="text-sm font-semibold">Activity</h5>
        <div className="flex relative gap-1 items-center">
          {workspaceMembersActivityLoader === "mutation" ? <Spinner size={12} className="animate-spin" /> : null}
          <button
            className="flex overflow-hidden relative flex-shrink-0 justify-center items-center w-6 h-6 rounded transition-colors cursor-pointer hover:bg-custom-background-80 text-custom-text-300"
            onClick={() => toggleWorkspaceMembersActivitySortOrder()}
          >
            {workspaceMembersActivitySortOrder === E_SORT_ORDER.ASC ? (
              <ArrowUpWideNarrow className="size-4" />
            ) : (
              <ArrowDownWideNarrow className="size-4" />
            )}
          </button>
          <button
            className="flex overflow-hidden relative flex-shrink-0 justify-center items-center w-6 h-6 rounded transition-colors cursor-pointer hover:bg-custom-background-80 text-custom-text-300"
            onClick={() => toggleWorkspaceMembersActivitySidebar(workspaceSlug, false)}
          >
            <X className="size-4" />
          </button>
        </div>
      </div>
      <div className="px-7 overflow-y-scroll">
        {workspaceMembersActivityLoader === "init-loader" ? (
          <Loader className="space-y-3">
            <Loader.Item height="34px" width="100%" />
            <Loader.Item height="34px" width="100%" />
            <Loader.Item height="34px" width="100%" />
          </Loader>
        ) : (
          <>{children}</>
        )}
      </div>
    </div>
  );
});
