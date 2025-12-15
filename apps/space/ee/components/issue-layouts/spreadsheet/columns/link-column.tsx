import React from "react";
import { observer } from "mobx-react";
// types
import type { IIssue } from "@/types/issue";

type Props = {
  issue: IIssue;
};

export const SpreadsheetLinkColumn = observer(function SpreadsheetLinkColumn(props: Props) {
  const { issue } = props;

  return (
    <div className="flex h-11 w-full items-center border-b-[0.5px] border-subtle-1 px-2.5 py-1 text-11 group-[.selected-issue-row]:bg-accent-primary/5 group-[.selected-issue-row]:hover:bg-accent-primary/10">
      {issue?.link_count} {issue?.link_count === 1 ? "link" : "links"}
    </div>
  );
});
