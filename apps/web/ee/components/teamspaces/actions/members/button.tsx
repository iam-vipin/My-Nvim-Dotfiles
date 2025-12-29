import { useState } from "react";
import { observer } from "mobx-react";

import { PlusIcon } from "@plane/propel/icons";
// helpers
import { TEAMSPACE_TRACKER_ELEMENTS } from "@plane/constants";
import { IconButton } from "@plane/propel/icon-button";
import { cn } from "@plane/utils";
// components
import { AddTeamspaceMembersModal } from "./modal";

type TAddTeamspaceMembersButtonProps = {
  teamspaceId: string;
  variant: "icon" | "sidebar";
  isEditingAllowed: boolean;
};

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
      {variant === "icon" && (
        <IconButton
          variant="secondary"
          size="base"
          icon={PlusIcon}
          onClick={() => setIsAddMembersModalOpen(true)}
          data-ph-element={TEAMSPACE_TRACKER_ELEMENTS.OVERVIEW_ADD_MEMBER_BUTTON}
          aria-label="Add member"
        />
      )}
      {variant === "sidebar" && (
        <button
          className="group flex items-center gap-x-2 cursor-pointer"
          onClick={() => setIsAddMembersModalOpen(true)}
          data-ph-element={TEAMSPACE_TRACKER_ELEMENTS.RIGHT_SIDEBAR_ADD_MEMBER_BUTTON}
        >
          <div
            className={cn(
              "flex-shrink-0 size-8 rounded-md inline-flex items-center justify-center",
              "bg-layer-transparent group-hover:bg-layer-transparent-hover active:bg-layer-transparent-active",
              "text-secondary transition-colors"
            )}
          >
            <PlusIcon className="size-5" strokeWidth={2} />
          </div>
          <span className="text-body-xs-medium text-placeholder group-hover:text-tertiary">Add new member</span>
        </button>
      )}
    </>
  );
});
