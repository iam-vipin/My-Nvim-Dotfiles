import type { FC } from "react";
import { observer } from "mobx-react";
import { useParams } from "next/navigation";
import { UserRound } from "lucide-react";
import { useTranslation } from "@plane/i18n";
import { SuspendedUserIcon } from "@plane/propel/icons";
import { Pill, EPillVariant, EPillSize } from "@plane/propel/pill";
import { EUserWorkspaceRoles } from "@plane/types";
import { Avatar, Tooltip } from "@plane/ui";
import { getFileURL } from "@plane/utils";
import { useMember } from "@/hooks/store/use-member";

export const UserAvatarName = observer(function UserAvatarName({
  userId,
  showName = true,
}: {
  userId: string;
  showName?: boolean;
}) {
  const { t } = useTranslation();
  const { workspaceSlug } = useParams();
  const {
    getUserDetails,
    workspace: { isUserSuspended, getWorkspaceMemberDetails },
  } = useMember();
  const user = getUserDetails(userId);
  const isSuspended = workspaceSlug && isUserSuspended(userId, workspaceSlug);
  const workspaceMember = getWorkspaceMemberDetails(userId);

  // Get role badge text
  const getRoleBadge = () => {
    if (isSuspended) {
      return "Suspended";
    }

    if (!workspaceMember) return null;

    switch (workspaceMember.role) {
      case EUserWorkspaceRoles.ADMIN:
        return "Admin";
      case EUserWorkspaceRoles.MEMBER:
        return "Member";
      case EUserWorkspaceRoles.GUEST:
        return "Guest";
      default:
        return null;
    }
  };

  const roleBadge = getRoleBadge();

  return (
    <Tooltip tooltipContent={user?.display_name ?? t(`Unassigned`)}>
      <div className="flex items-center gap-2 min-w-0">
        {isSuspended ? (
          <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-custom-background-80">
            <SuspendedUserIcon className="h-4 w-4 text-custom-text-400" />
          </div>
        ) : user?.avatar_url && user?.avatar_url !== "" ? (
          <Avatar
            className="shrink-0"
            name={user?.display_name}
            src={getFileURL(user?.avatar_url)}
            size={24}
            shape="circle"
          />
        ) : (
          <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-custom-background-80 capitalize overflow-hidden">
            {user?.display_name ? user?.display_name?.[0] : <UserRound className="text-custom-text-200" size={12} />}
          </div>
        )}
        {showName && (
          <div className="flex items-center gap-2 min-w-0">
            <span className={`flex-1 truncate ${isSuspended ? "text-custom-text-400" : "text-custom-text-200"}`}>
              {user?.display_name ?? t(`Unassigned`)}
            </span>
            <div className="flex items-center gap-1 shrink-0">
              {roleBadge && (
                <Pill variant={EPillVariant.DEFAULT} size={EPillSize.XS} className="border-none">
                  {roleBadge}
                </Pill>
              )}
            </div>
          </div>
        )}
      </div>
    </Tooltip>
  );
});
