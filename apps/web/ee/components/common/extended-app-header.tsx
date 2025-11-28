import type { ReactNode } from "react";
import { observer } from "mobx-react";
import { useParams } from "react-router";
// components
import { AppSidebarToggleButton } from "@/components/sidebar/sidebar-toggle-button";
// hooks
import { useAppTheme } from "@/hooks/store/use-app-theme";
import { useProjectNavigationPreferences } from "@/hooks/use-navigation-preferences";

export const ExtendedAppHeader = observer((props: { header: ReactNode }) => {
  const { header } = props;
  // router
  const { projectId, workItem } = useParams();
  // store hooks
  const { sidebarCollapsed } = useAppTheme();
  // preferences
  const { preferences: projectPreferences } = useProjectNavigationPreferences();
  // derived values
  const shouldShowSidebarToggleButton = projectPreferences.navigationMode === "accordion" || (!projectId && !workItem);

  return (
    <>
      {sidebarCollapsed && shouldShowSidebarToggleButton && <AppSidebarToggleButton />}
      <div className="flex items-center gap-2 divide-x divide-custom-border-100 w-full">
        <div className="w-full flex-1">{header}</div>
      </div>
    </>
  );
});
