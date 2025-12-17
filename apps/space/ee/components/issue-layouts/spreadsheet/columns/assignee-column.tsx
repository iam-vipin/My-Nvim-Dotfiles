import React from "react";
import { observer } from "mobx-react";
// types
import { IssueBlockMembers } from "@/components/issues/issue-layouts/properties/member";
import type { IIssue } from "@/types/issue";
// components

type Props = {
  issue: IIssue;
};

export const SpreadsheetAssigneeColumn = observer(function SpreadsheetAssigneeColumn(props: Props) {
  const { issue } = props;

  return (
    <div className="h-11 border-b-[0.5px] border-subtle-1 pl-2">
      <IssueBlockMembers memberIds={issue.assignee_ids} shouldShowBorder={false} />
    </div>
  );
});
