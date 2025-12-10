import { observer } from "mobx-react";
import { BaseKanBanRoot } from "@/components/issues/issue-layouts/kanban/base-kanban-root";
import { ProjectEpicQuickActions } from "@/plane-web/components/epics/quick-actions/epic-quick-action";

export const EpicKanBanLayout = observer(function EpicKanBanLayout() {
  return <BaseKanBanRoot QuickActions={ProjectEpicQuickActions} isEpic />;
});
