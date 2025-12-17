import React from "react";
import { observer } from "mobx-react";
// components
import { IssueBlockPriority } from "@/components/issues/issue-layouts/properties/priority";
// types
import type { IIssue } from "@/types/issue";

type Props = {
  issue: IIssue;
};

export const SpreadsheetPriorityColumn = observer(function SpreadsheetPriorityColumn(props: Props) {
  const { issue } = props;

  return (
    <div className="h-11 flex items-center pl-2 border-b-[0.5px] border-subtle-1">
      <IssueBlockPriority priority={issue.priority} shouldShowName />
    </div>
  );
});
