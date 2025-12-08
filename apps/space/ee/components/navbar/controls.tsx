import type { FC } from "react";
import { useEffect } from "react";
import { observer } from "mobx-react";
// components
import { NavbarTheme } from "@/components/issues/navbar/theme";
import { UserAvatar } from "@/components/issues/navbar/user-avatar";
// hooks
import useIsInIframe from "@/hooks/use-is-in-iframe";
// plane-web
import { useViewIssuesFilter } from "@/plane-web/hooks/store/use-view-issues-filter";
// store
import type { PublishStore } from "@/store/publish/publish.store";
import { ViewIssueFilters } from "../issue-layouts/filters/root";

export type NavbarControlsProps = {
  publishSettings: PublishStore;
};

export const ViewNavbarControls = observer(function ViewNavbarControls(props: NavbarControlsProps) {
  // props
  const { publishSettings } = props;
  // hooks
  const { initIssueFilters } = useViewIssuesFilter();
  // derived values
  const { anchor } = publishSettings;

  const isInIframe = useIsInIframe();

  useEffect(() => {
    if (anchor) initIssueFilters(anchor, {});
  }, [anchor, initIssueFilters]);

  if (!anchor) return null;

  return (
    <>
      {/* issue filters */}
      <div className="relative flex flex-shrink-0 items-center gap-1 transition-all delay-150 ease-in-out">
        <ViewIssueFilters anchor={anchor} />
      </div>

      {/* theming */}
      <div className="relative flex-shrink-0">
        <NavbarTheme />
      </div>

      {!isInIframe && <UserAvatar />}
    </>
  );
});
