import { isDesktopApp } from "@todesktop/client-core/platform/todesktop";
// components
import { WorkspaceMenuRoot } from "@/components/workspace/sidebar/workspace-menu-root";

export function DesktopSidebarWorkspaceMenu() {
  if (!isDesktopApp()) return null;
  return (
    <div className="pb-1.5">
      <WorkspaceMenuRoot variant="sidebar" />
    </div>
  );
}
