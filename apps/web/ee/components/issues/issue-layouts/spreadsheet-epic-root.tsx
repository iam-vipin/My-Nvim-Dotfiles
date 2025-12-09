import React from "react";
import { observer } from "mobx-react";
// components
import { BaseSpreadsheetRoot } from "@/components/issues/issue-layouts/spreadsheet/base-spreadsheet-root";
// plane web imports
import { ProjectEpicQuickActions } from "@/plane-web/components/epics/quick-actions/epic-quick-action";

export const EpicSpreadsheetLayout = observer(function EpicSpreadsheetLayout() {
  return <BaseSpreadsheetRoot QuickActions={ProjectEpicQuickActions} isEpic />;
});
