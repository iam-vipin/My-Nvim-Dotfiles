import React from "react";
import { observer } from "mobx-react";
// types
// components
import { IssueBlockCycle } from "@/components/issues/issue-layouts/properties/cycle";
import type { IIssue } from "@/types/issue";

type Props = {
  issue: IIssue;
};

export const SpreadsheetCycleColumn = observer(function SpreadsheetCycleColumn(props: Props) {
  const { issue } = props;

  return (
    <div className="h-11 border-b-[0.5px] border-subtle-1">
      <IssueBlockCycle cycleId={issue.cycle_id ?? undefined} shouldShowBorder={false} />
    </div>
  );
});
