import type { ReactNode } from "react";
import { observer } from "mobx-react";
import { AppSidebarToggleButton } from "@/components/sidebar/sidebar-toggle-button";
import { useAppTheme } from "@/hooks/store/use-app-theme";
import { isSidebarToggleVisible } from "../desktop/helper";

export const ExtendedAppHeader = observer((props: { header: ReactNode }) => {
  const { header } = props;
  // store hooks
  const { sidebarCollapsed } = useAppTheme();

  return (
    <>
      {isSidebarToggleVisible() && sidebarCollapsed && <AppSidebarToggleButton />}
      <div className="flex items-center gap-2 divide-x divide-custom-border-100 w-full">
        <div className="w-full flex-1">{header}</div>
      </div>
    </>
  );
});
