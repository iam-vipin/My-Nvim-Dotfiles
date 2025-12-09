import React from "react";
import { observer } from "mobx-react";
// constants
import { IssueBlockModules } from "@/components/issues/issue-layouts/properties/modules";
// types
import type { IIssue } from "@/types/issue";

type Props = {
  issue: IIssue;
};

export const SpreadsheetModuleColumn = observer(function SpreadsheetModuleColumn(props: Props) {
  const { issue } = props;

  return (
    <div className="h-11 border-b-[0.5px] border-custom-border-200">
      <IssueBlockModules moduleIds={issue.module_ids ?? undefined} shouldShowBorder={false} />
    </div>
  );
});
