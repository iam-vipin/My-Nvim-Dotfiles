/**
 * SPDX-FileCopyrightText: 2023-present Plane Software, Inc.
 * SPDX-License-Identifier: LicenseRef-Plane-Commercial
 *
 * Licensed under the Plane Commercial License (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * https://plane.so/legals/eula
 *
 * DO NOT remove or modify this notice.
 * NOTICE: Proprietary and confidential. Unauthorized use or distribution is prohibited.
 */

import type { FC } from "react";
import { CalendarDays, Signal, Paperclip } from "lucide-react";
// plane imports
import { LayersIcon, LinkIcon, DoubleCircleIcon } from "@plane/propel/icons";
import type { ISvgIcons } from "@plane/propel/icons";
// components
import { SpreadsheetLeadColumn } from "@/components/projects/list/with-grouping/layouts/spreadsheet/columns/lead-column";
import { SpreadsheetMembersColumn } from "@/components/projects/list/with-grouping/layouts/spreadsheet/columns/members-column";
import { SpreadsheetPriorityColumn } from "@/components/projects/list/with-grouping/layouts/spreadsheet/columns/priority-column";
import { SpreadsheetStateColumn } from "@/components/projects/list/with-grouping/layouts/spreadsheet/columns/state-column";
import { SpreadsheetUpdatedOnColumn } from "@/components/projects/list/with-grouping/layouts/spreadsheet/columns/updated-on-column";
import { SpreadsheetIssueColumn } from "@/components/projects/list/with-grouping/layouts/spreadsheet/columns/issue-column";
// types
import type { TProject } from "@/types/projects";

export type IProjectDisplayProperties = {
  priority?: boolean;
  state?: boolean;
  duration: string;
  lead: string;
  members_count: number;
  issue_count: number;
};

export const SPREADSHEET_PROPERTY_DETAILS: {
  [key: string]: {
    title: string;
    ascendingOrderTitle: string;
    descendingOrderTitle: string;
    icon: FC<ISvgIcons>;
    isSortingAllowed?: boolean;
    Column: React.FC<{
      project: TProject;
      onClose?: () => void;
      onChange: (project: TProject, data: Partial<TProject>) => void;
      disabled: boolean;
    }>;
  };
} = {
  priority: {
    title: "Priority",
    ascendingOrderTitle: "None",
    descendingOrderTitle: "Urgent",
    icon: Signal,
    Column: SpreadsheetPriorityColumn,
    isSortingAllowed: true,
  },

  state: {
    title: "State",
    ascendingOrderTitle: "A",
    descendingOrderTitle: "Z",
    icon: DoubleCircleIcon,
    Column: SpreadsheetStateColumn,
    isSortingAllowed: true,
  },
  duration: {
    title: "Start date -> End date",
    ascendingOrderTitle: "New",
    descendingOrderTitle: "Old",
    icon: CalendarDays,
    Column: SpreadsheetUpdatedOnColumn,
    isSortingAllowed: true,
  },
  lead: {
    title: "Lead",
    ascendingOrderTitle: "Most",
    descendingOrderTitle: "Least",
    icon: LinkIcon,
    Column: SpreadsheetLeadColumn,
    isSortingAllowed: false,
  },
  members_count: {
    title: "No. of Members",
    ascendingOrderTitle: "Least",
    descendingOrderTitle: "Most",
    icon: Paperclip,
    Column: SpreadsheetMembersColumn,
    isSortingAllowed: true,
  },
  issue_count: {
    title: "No. of Work items",
    ascendingOrderTitle: "Most",
    descendingOrderTitle: "Least",
    icon: LayersIcon,
    Column: SpreadsheetIssueColumn,
    isSortingAllowed: true,
  },
};

export const SPREADSHEET_PROPERTY_LIST: (keyof IProjectDisplayProperties)[] = [
  "state",
  "priority",
  "duration",
  "lead",
  "members_count",
  "issue_count",
];

export const SPREADSHEET_SELECT_GROUP = "spreadsheet-issues";
