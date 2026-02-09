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

import type { IIssueFilterOptions, TIssueActivityComment } from "@plane/types";
import {
  ISSUE_DISPLAY_PROPERTIES_KEYS,
  EPICS_DISPLAY_PROPERTIES_KEYS,
  SUB_ISSUES_DISPLAY_PROPERTIES_KEYS,
} from "./common";
import type { TActivityFilters, TFiltersLayoutOptions, TIssueFiltersToDisplayByPageType } from "./filter";

export const ADDITIONAL_WORK_ITEM_FILTERS_KEYS = ["name", "milestone_id"] as const;

export const ADDITIONAL_WORK_ITEM_GROUP_BY_KEYS = ["milestone"] as const;

export const ADDITIONAL_ISSUE_DISPLAY_FILTERS_BY_PAGE: TIssueFiltersToDisplayByPageType = {
  team_issues: {
    filters: [
      "priority",
      "state_group",
      "assignee_id",
      "mention_id",
      "created_by_id",
      "start_date",
      "target_date",
      "team_project_id",
      ...ADDITIONAL_WORK_ITEM_FILTERS_KEYS,
    ],
    layoutOptions: {
      list: {
        display_properties: ISSUE_DISPLAY_PROPERTIES_KEYS,
        display_filters: {
          group_by: ["state_detail.group", "priority", "team_project", "assignees", null],
          order_by: ["sort_order", "-created_at", "-updated_at", "start_date", "-priority"],
          type: ["active", "backlog"],
        },
        extra_options: {
          access: true,
          values: ["show_empty_groups", "sub_issue"],
        },
      },
      kanban: {
        display_properties: ISSUE_DISPLAY_PROPERTIES_KEYS,
        display_filters: {
          group_by: ["state_detail.group", "priority", "team_project", "assignees", null],
          sub_group_by: ["state_detail.group", "priority", "team_project", "assignees", null],
          order_by: ["sort_order", "-created_at", "-updated_at", "start_date", "-priority", "target_date"],
          type: ["active", "backlog"],
        },
        extra_options: {
          access: true,
          values: ["show_empty_groups", "sub_issue"],
        },
      },
      calendar: {
        display_properties: ["key", "issue_type"],
        display_filters: {
          type: ["active", "backlog"],
        },
        extra_options: {
          access: true,
          values: ["sub_issue"],
        },
      },
      spreadsheet: {
        display_properties: ISSUE_DISPLAY_PROPERTIES_KEYS,
        display_filters: {
          order_by: ["sort_order", "-created_at", "-updated_at", "start_date", "-priority"],
          type: ["active", "backlog"],
        },
        extra_options: {
          access: true,
          values: ["sub_issue"],
        },
      },
      gantt_chart: {
        display_properties: ["key", "issue_type"],
        display_filters: {
          order_by: ["sort_order", "-created_at", "-updated_at", "start_date", "-priority"],
          type: ["active", "backlog"],
        },
        extra_options: {
          access: true,
          values: ["sub_issue"],
        },
      },
    },
  },
  // TODO: Check if this is even required now? Because we can uses project issues properties for this case.
  team_project_work_items: {
    filters: [
      "priority",
      "state_group",
      "assignee_id",
      "mention_id",
      "created_by_id",
      "start_date",
      "target_date",
      ...ADDITIONAL_WORK_ITEM_FILTERS_KEYS,
    ],
    layoutOptions: {
      list: {
        display_properties: ISSUE_DISPLAY_PROPERTIES_KEYS,
        display_filters: {
          group_by: ["state_detail.group", "priority", "assignees", null],
          order_by: ["sort_order", "-created_at", "-updated_at", "start_date", "-priority"],
          type: ["active", "backlog"],
        },
        extra_options: {
          access: true,
          values: ["show_empty_groups", "sub_issue"],
        },
      },
      kanban: {
        display_properties: ISSUE_DISPLAY_PROPERTIES_KEYS,
        display_filters: {
          group_by: ["state_detail.group", "priority", "assignees", null],
          sub_group_by: ["state_detail.group", "priority", "assignees", null],
          order_by: ["sort_order", "-created_at", "-updated_at", "start_date", "-priority", "target_date"],
          type: ["active", "backlog"],
        },
        extra_options: {
          access: true,
          values: ["show_empty_groups", "sub_issue"],
        },
      },
      calendar: {
        display_properties: ["key", "issue_type"],
        display_filters: {
          type: ["active", "backlog"],
        },
        extra_options: {
          access: true,
          values: ["sub_issue"],
        },
      },
      spreadsheet: {
        display_properties: ISSUE_DISPLAY_PROPERTIES_KEYS,
        display_filters: {
          order_by: ["sort_order", "-created_at", "-updated_at", "start_date", "-priority"],
          type: ["active", "backlog"],
        },
        extra_options: {
          access: true,
          values: ["sub_issue"],
        },
      },
      gantt_chart: {
        display_properties: ["key", "issue_type"],
        display_filters: {
          order_by: ["sort_order", "-created_at", "-updated_at", "start_date", "-priority"],
          type: ["active", "backlog"],
        },
        extra_options: {
          access: true,
          values: ["sub_issue"],
        },
      },
    },
  },
  epics: {
    filters: [
      "priority",
      "state_group",
      "state_id",
      "assignee_id",
      "mention_id",
      "created_by_id",
      "label_id",
      "start_date",
      "target_date",
      ...ADDITIONAL_WORK_ITEM_FILTERS_KEYS,
    ],
    layoutOptions: {
      list: {
        display_properties: EPICS_DISPLAY_PROPERTIES_KEYS,
        display_filters: {
          group_by: ["state", "priority", "labels", "assignees", "created_by", "milestone", null],
          order_by: ["sort_order", "-created_at", "-updated_at", "start_date", "-priority"],
          type: ["active", "backlog"],
        },
        extra_options: {
          access: true,
          values: ["show_empty_groups"],
        },
      },
      kanban: {
        display_properties: EPICS_DISPLAY_PROPERTIES_KEYS,
        display_filters: {
          group_by: ["state", "priority", "labels", "assignees", "created_by", "milestone"],
          sub_group_by: ["state", "priority", "labels", "assignees", "created_by", null],
          order_by: ["sort_order", "-created_at", "-updated_at", "start_date", "-priority", "target_date"],
          type: ["active", "backlog"],
        },
        extra_options: {
          access: true,
          values: ["show_empty_groups"],
        },
      },
      calendar: {
        display_properties: ["key", "issue_type"],
        display_filters: {
          type: ["active", "backlog"],
        },
        extra_options: {
          access: true,
          values: [],
        },
      },
      spreadsheet: {
        display_properties: EPICS_DISPLAY_PROPERTIES_KEYS,
        display_filters: {
          order_by: ["sort_order", "-created_at", "-updated_at", "start_date", "-priority"],
          type: ["active", "backlog"],
        },
        extra_options: {
          access: true,
          values: [],
        },
      },
      gantt_chart: {
        display_properties: ["key", "issue_type"],
        display_filters: {
          order_by: ["sort_order", "-created_at", "-updated_at", "start_date", "-priority"],
          type: ["active", "backlog"],
        },
        extra_options: {
          access: true,
          values: [],
        },
      },
    },
  },
  initiatives: {
    filters: ["priority", "state_group", "project_id", "type_id", "assignee_id", "start_date", "target_date"],
    layoutOptions: {
      list: {
        display_properties: SUB_ISSUES_DISPLAY_PROPERTIES_KEYS,
        display_filters: {
          order_by: ["-created_at", "-updated_at", "start_date", "-priority"],
          group_by: ["state_detail.group", "priority", "assignees", null],
        },
        extra_options: {
          access: true,
          values: ["sub_issue"],
        },
      },
    },
  },
};

export const ADDITIONAL_MY_ISSUES_DISPLAY_FILTERS: TFiltersLayoutOptions = {
  gantt_chart: {
    display_properties: ["key", "issue_type"],
    display_filters: {
      order_by: ["sort_order", "-created_at", "-updated_at", "start_date", "-priority"],
      type: ["active", "backlog"],
    },
    extra_options: {
      access: true,
      values: ["sub_issue"],
    },
  },
  kanban: {
    display_properties: ["key", "issue_type"],
    display_filters: {
      group_by: ["state_detail.group", "priority", "assignees", "labels", "created_by", "project"],
      sub_group_by: ["state_detail.group", "priority", "assignees", "labels", "created_by", "project", null],
    },
    extra_options: {
      access: true,
      values: ["sub_issue", "show_empty_groups"],
    },
  },
  calendar: {
    display_properties: ["key", "issue_type"],
    display_filters: {
      type: ["active", "backlog"],
    },
    extra_options: {
      access: true,
      values: [],
    },
  },
};

export const SUB_WORK_ITEM_AVAILABLE_FILTERS_FOR_INITIATIVES_PAGE: (keyof IIssueFilterOptions)[] = [
  "priority",
  "state_group",
  "project",
  "issue_type",
  "assignees",
  "start_date",
  "target_date",
];

export enum EActivityFilterTypeEE {
  WORKLOG = "WORKLOG",
  ISSUE_ADDITIONAL_PROPERTIES_ACTIVITY = "ISSUE_ADDITIONAL_PROPERTIES_ACTIVITY",
}

// EE: Activity filter type options for extended filters
export const EE_ACTIVITY_FILTER_TYPE_OPTIONS: Record<EActivityFilterTypeEE, { labelTranslationKey: string }> = {
  [EActivityFilterTypeEE.WORKLOG]: {
    labelTranslationKey: "common.worklogs",
  },
  [EActivityFilterTypeEE.ISSUE_ADDITIONAL_PROPERTIES_ACTIVITY]: {
    labelTranslationKey: "common.additional_updates",
  },
};

// EE: Default activity filters for extended features
export const EE_DEFAULT_ACTIVITY_FILTERS: EActivityFilterTypeEE[] = [
  EActivityFilterTypeEE.WORKLOG,
  EActivityFilterTypeEE.ISSUE_ADDITIONAL_PROPERTIES_ACTIVITY,
];

export const shouldRenderActivity = (activity: TIssueActivityComment, filter: TActivityFilters): boolean =>
  activity.activity_type === filter;

export type TActivityFiltersEE =
  | EActivityFilterTypeEE.WORKLOG
  | EActivityFilterTypeEE.ISSUE_ADDITIONAL_PROPERTIES_ACTIVITY;
