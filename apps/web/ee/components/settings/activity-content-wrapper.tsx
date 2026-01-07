import type { ReactNode } from "react";
import { observer } from "mobx-react";
import { Loader as Spinner } from "lucide-react";
// plane imports
import { E_SORT_ORDER } from "@plane/constants";
import { Loader } from "@plane/ui";
import { cn } from "@plane/utils";
import type { TLoader, TBaseActivity } from "@plane/types";
import { ActivitySortRoot } from "@/components/issues/issue-detail/issue-activity/sort-root";
import { CloseIcon } from "@plane/propel/icons";
import { getButtonStyling } from "@plane/propel/button";

type TActivityContentWrapperProps = {
  children: ReactNode;
  isSidebarOpen: boolean;
  membersActivityLoader: TLoader;
  membersActivitySortOrder: E_SORT_ORDER;
  membersActivity: TBaseActivity[];
  toggleMembersActivitySortOrder: () => void;
  toggleMembersActivitySidebar: () => void;
};

export const ActivityContentWrapper = observer(function ActivityContentWrapper(props: TActivityContentWrapperProps) {
  const {
    children,
    isSidebarOpen,
    membersActivityLoader,
    membersActivitySortOrder,
    membersActivity,
    toggleMembersActivitySortOrder,
    toggleMembersActivitySidebar,
  } = props;

  return (
    <div
      className={cn(
        "flex overflow-y-scroll absolute right-0 flex-col pb-10 h-full border-l ease-linear border-subtle-1 bg-surface-1 xl:relative transition-[width] md:pt-page-y",
        {
          "hidden w-0": !isSidebarOpen,
          "sm:min-w-[368px] max-w-[368px]": isSidebarOpen,
        }
      )}
      aria-hidden={!isSidebarOpen}
    >
      <div className="flex gap-2 justify-between items-center px-7 pb-5">
        <h5 className="text-sm font-semibold">Activity</h5>
        <div className="flex items-center gap-2">
          {membersActivityLoader === "mutation" ? <Spinner size={12} className="animate-spin" /> : null}
          {membersActivity && membersActivity.length > 0 && (
            <ActivitySortRoot sortOrder={membersActivitySortOrder} toggleSort={toggleMembersActivitySortOrder} />
          )}
          <button
            className={cn(getButtonStyling("secondary", "base"), "py-1 px-2 text-tertiary cursor-pointer")}
            onClick={toggleMembersActivitySidebar}
          >
            <CloseIcon className="size-3" />
          </button>
        </div>
      </div>
      <div className="px-7 overflow-y-scroll h-full">
        {membersActivityLoader === "init-loader" ? (
          <Loader className="space-y-3">
            <Loader.Item height="34px" width="100%" />
            <Loader.Item height="34px" width="100%" />
            <Loader.Item height="34px" width="100%" />
          </Loader>
        ) : membersActivity && membersActivity.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <p className="text-sm text-tertiary">No activity yet</p>
          </div>
        ) : (
          <>{children}</>
        )}
      </div>
    </div>
  );
});
