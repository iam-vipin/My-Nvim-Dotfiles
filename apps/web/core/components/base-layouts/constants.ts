import { BoardLayoutIcon, ListLayoutIcon, TimelineLayoutIcon } from "@plane/propel/icons";
import type { IBaseLayoutConfig } from "@plane/types";

export const BASE_LAYOUTS: IBaseLayoutConfig[] = [
  {
    key: "list",
    icon: ListLayoutIcon,
    i18n_title: "issue.layouts.title.list",
  },
  {
    key: "kanban",
    icon: BoardLayoutIcon,
    i18n_title: "issue.layouts.title.kanban",
  },
  {
    key: "gantt",
    icon: TimelineLayoutIcon,
    i18n_title: "issue.layouts.title.gantt",
  },
];
