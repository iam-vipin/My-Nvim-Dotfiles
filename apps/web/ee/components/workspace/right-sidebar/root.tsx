import { observer } from "mobx-react";
import { usePathname } from "next/navigation";
// components
import { pathnameToAccessKey } from "@/components/settings/helper";
// plane imports
import { E_FEATURE_FLAGS, WORKSPACE_SETTINGS } from "@plane/constants";
// plane web components
import { WorkspaceMembersActivitySidebar } from "@/plane-web/components/workspace/members/sidebar";
import { useFlag } from "@/plane-web/hooks/store";

type TWorkspaceSettingsRightSidebarProps = { workspaceSlug: string };

export const WorkspaceSettingsRightSidebar = observer(function WorkspaceSettingsRightSidebar(
  props: TWorkspaceSettingsRightSidebarProps
) {
  const { workspaceSlug } = props;
  // next hooks
  const pathname = usePathname();
  // derived values
  const { accessKey } = pathnameToAccessKey(pathname);
  // store hooks
  const isMembersActivityEnabled = useFlag(workspaceSlug, E_FEATURE_FLAGS.WORKSPACE_MEMBER_ACTIVITY);

  return (
    <>
      {/* Members activity sidebar */}
      {accessKey === WORKSPACE_SETTINGS["members"]["href"] && isMembersActivityEnabled && (
        <div className="block">
          <WorkspaceMembersActivitySidebar workspaceSlug={workspaceSlug} />
        </div>
      )}
    </>
  );
});
