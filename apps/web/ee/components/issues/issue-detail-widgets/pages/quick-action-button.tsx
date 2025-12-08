import type { FC } from "react";
import React from "react";
import { observer } from "mobx-react";
import { Plus } from "lucide-react";
// plane imports
import type { TIssueServiceType } from "@plane/types";
// hooks
import { useIssueDetail } from "@/hooks/store/use-issue-detail";

type Props = {
  workItemId: string;
  customButton?: React.ReactNode;
  disabled?: boolean;
  issueServiceType: TIssueServiceType;
};

export const PagesActionButton = observer(function PagesActionButton(props: Props) {
  const { customButton, disabled = false, workItemId, issueServiceType } = props;
  // store hooks
  const { togglePagesModal } = useIssueDetail(issueServiceType);

  // handlers
  const handleOnClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    e.stopPropagation();
    togglePagesModal(workItemId);
  };

  return (
    <button type="button" onClick={handleOnClick} disabled={disabled}>
      {customButton ? customButton : <Plus className="h-4 w-4" />}
    </button>
  );
});
