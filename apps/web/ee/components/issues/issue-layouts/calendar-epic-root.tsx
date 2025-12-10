import { observer } from "mobx-react";
import { BaseCalendarRoot } from "@/components/issues/issue-layouts/calendar/base-calendar-root";
import { ProjectEpicQuickActions } from "@/plane-web/components/epics/quick-actions/epic-quick-action";

export const EpicCalendarLayout = observer(function EpicCalendarLayout() {
  return <BaseCalendarRoot QuickActions={ProjectEpicQuickActions} isEpic />;
});
