import React from "react";
import { observer } from "mobx-react";
// types
// components
import { IssueBlockState } from "@/components/issues/issue-layouts/properties/state";
import type { IIssue } from "@/types/issue";

type Props = {
  issue: IIssue;
};

export const SpreadsheetStateColumn: React.FC<Props> = observer((props) => {
  const { issue } = props;

  if (!issue.state_id) return null;

  return (
    <div className="h-11 border-b-[0.5px] border-custom-border-200">
      <IssueBlockState stateId={issue.state_id} shouldShowBorder={false} />
    </div>
  );
});
