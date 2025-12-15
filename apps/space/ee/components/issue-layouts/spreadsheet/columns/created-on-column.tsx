import React from "react";
import { observer } from "mobx-react";
// helpers
import { renderFormattedDate } from "@/helpers/date-time.helper";
// types
import type { IIssue } from "@/types/issue";

type Props = {
  issue: IIssue;
};

export const SpreadsheetCreatedOnColumn = observer(function SpreadsheetCreatedOnColumn(props: Props) {
  const { issue } = props;

  return (
    <div className="flex h-11 w-full items-center justify-center border-b-[0.5px] border-subtle-1 text-11 group-[.selected-issue-row]:bg-accent-primary/5 group-[.selected-issue-row]:hover:bg-accent-primary/10">
      {renderFormattedDate(issue.created_at)}
    </div>
  );
});
