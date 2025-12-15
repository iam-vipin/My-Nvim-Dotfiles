import { useState } from "react";
import { observer } from "mobx-react";
import { Plus } from "lucide-react";
// helpers
import { TEAMSPACE_TRACKER_ELEMENTS } from "@plane/constants";
import { cn } from "@plane/utils";
// components
import { AddTeamspaceMembersModal } from "./modal";

type TAddTeamspaceMembersButtonProps = {
  teamspaceId: string;
  variant: "icon" | "sidebar";
  isEditingAllowed: boolean;
};

const AddMembersIcon = observer(function AddMembersIcon(props: {
  containerSize: number;
  iconSize: number;
  containerClassName?: string;
  iconClassName?: string;
}) {
  const { containerSize, iconSize, containerClassName, iconClassName } = props;
  return (
    <div
      style={{
        width: containerSize,
        height: containerSize,
      }}
      className={cn(
        `bg-layer-1 hover:bg-layer-1-hover group-hover:bg-layer-1-hover rounded-full flex items-center justify-center`,
        containerClassName
      )}
    >
      <Plus
        style={{
          width: iconSize,
          height: iconSize,
        }}
        className={cn("text-tertiary hover:text-secondary group-hover:text-secondary", iconClassName)}
        strokeWidth={2}
      />
    </div>
  );
});

export const AddTeamspaceMembersButton = observer(function AddTeamspaceMembersButton(
  props: TAddTeamspaceMembersButtonProps
) {
  const { teamspaceId, variant, isEditingAllowed } = props;
  // state
  const [isAddMembersModalOpen, setIsAddMembersModalOpen] = useState(false);

  if (!isEditingAllowed) return null;

  return (
    <>
      <AddTeamspaceMembersModal
        teamspaceId={teamspaceId}
        isModalOpen={isAddMembersModalOpen}
        handleModalClose={() => setIsAddMembersModalOpen(false)}
      />
      <button
        className="flex-shrink-0 cursor-pointer"
        onClick={() => setIsAddMembersModalOpen(true)}
        data-ph-element={
          variant === "icon"
            ? TEAMSPACE_TRACKER_ELEMENTS.OVERVIEW_ADD_MEMBER_BUTTON
            : TEAMSPACE_TRACKER_ELEMENTS.RIGHT_SIDEBAR_ADD_MEMBER_BUTTON
        }
      >
        {variant === "icon" && <AddMembersIcon containerSize={24} iconSize={16} />}
        {variant === "sidebar" && (
          <div className="group flex items-center gap-x-2">
            <span className="flex-shrink-0 relative rounded-full">
              <AddMembersIcon containerSize={32} iconSize={18} />
            </span>
            <span className="text-body-xs-medium text-placeholder group-hover:text-tertiary">Add new member</span>
          </div>
        )}
      </button>
    </>
  );
});
