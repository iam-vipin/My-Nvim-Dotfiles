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

// plane imports
import { EUserProjectRoles } from "@plane/types";
import type { TProjectSettingsItem, TProjectSettingsTabs } from "@plane/types";

export enum PROJECT_SETTINGS_CATEGORY {
  GENERAL = "general",
  WORK_STRUCTURE = "work-structure",
  EXECUTION = "execution",
}

export const PROJECT_SETTINGS_CATEGORIES: PROJECT_SETTINGS_CATEGORY[] = [
  PROJECT_SETTINGS_CATEGORY.GENERAL,
  PROJECT_SETTINGS_CATEGORY.WORK_STRUCTURE,
  PROJECT_SETTINGS_CATEGORY.EXECUTION,
];

export const PROJECT_SETTINGS: Record<TProjectSettingsTabs, TProjectSettingsItem> = {
  general: {
    key: "general",
    i18n_label: "common.general",
    href: ``,
    access: [EUserProjectRoles.ADMIN, EUserProjectRoles.MEMBER, EUserProjectRoles.GUEST],
    highlight: (pathname: string, baseUrl: string) => pathname === `${baseUrl}/`,
  },
  members: {
    key: "members",
    i18n_label: "common.members",
    href: `/members`,
    access: [EUserProjectRoles.ADMIN, EUserProjectRoles.MEMBER, EUserProjectRoles.GUEST],
    highlight: (pathname: string, baseUrl: string) => pathname === `${baseUrl}/members/`,
  },
  features: {
    key: "features",
    i18n_label: "common.features",
    href: `/features`,
    access: [EUserProjectRoles.ADMIN],
    highlight: (pathname: string, baseUrl: string) => pathname === `${baseUrl}/features/`,
  },
  states: {
    key: "states",
    i18n_label: "common.states",
    href: `/states`,
    access: [EUserProjectRoles.ADMIN, EUserProjectRoles.MEMBER],
    highlight: (pathname: string, baseUrl: string) => pathname === `${baseUrl}/states/`,
  },
  labels: {
    key: "labels",
    i18n_label: "common.labels",
    href: `/labels`,
    access: [EUserProjectRoles.ADMIN, EUserProjectRoles.MEMBER],
    highlight: (pathname: string, baseUrl: string) => pathname === `${baseUrl}/labels/`,
  },
  estimates: {
    key: "estimates",
    i18n_label: "common.estimates",
    href: `/estimates`,
    access: [EUserProjectRoles.ADMIN],
    highlight: (pathname: string, baseUrl: string) => pathname === `${baseUrl}/estimates/`,
  },
  automations: {
    key: "automations",
    i18n_label: "project_settings.automations.label",
    href: `/automations`,
    access: [EUserProjectRoles.ADMIN],
    highlight: (pathname: string, baseUrl: string) => pathname === `${baseUrl}/automations/`,
  },
  "work-item-types": {
    key: "work-item-types",
    i18n_label: "work_item_types.label",
    href: `/work-item-types`,
    access: [EUserProjectRoles.ADMIN],
    highlight: (pathname: string, baseUrl: string) => pathname === `${baseUrl}/work-item-types/`,
  },
  workflows: {
    key: "workflows",
    i18n_label: "common.workflows",
    href: `/workflows`,
    access: [EUserProjectRoles.ADMIN],
    highlight: (pathname: string, baseUrl: string) => pathname === `${baseUrl}/workflows/`,
  },
  epics: {
    key: "epics",
    i18n_label: "common.epics",
    href: `/epics`,
    access: [EUserProjectRoles.ADMIN],
    highlight: (pathname: string, baseUrl: string) => pathname === `${baseUrl}/epics/`,
  },
  project_updates: {
    key: "project_updates",
    i18n_label: "common.project_updates",
    href: `/project-updates`,
    access: [EUserProjectRoles.ADMIN],
    highlight: (pathname: string, baseUrl: string) => pathname === `${baseUrl}/project-updates/`,
  },
  templates: {
    key: "templates",
    i18n_label: "common.templates",
    href: `/templates`,
    access: [EUserProjectRoles.ADMIN, EUserProjectRoles.MEMBER],
    highlight: (pathname: string, baseUrl: string) => pathname.startsWith(`${baseUrl}/templates/`),
  },
  recurring_work_items: {
    key: "recurring_work_items",
    i18n_label: "common.recurring_work_items",
    href: `/recurring-work-items`,
    access: [EUserProjectRoles.ADMIN],
    highlight: (pathname: string, baseUrl: string) => pathname.startsWith(`${baseUrl}/recurring-work-items/`),
  },
};

export const PROJECT_SETTINGS_FLAT_MAP: TProjectSettingsItem[] = Object.values(PROJECT_SETTINGS);

export const GROUPED_PROJECT_SETTINGS: Record<PROJECT_SETTINGS_CATEGORY, TProjectSettingsItem[]> = {
  [PROJECT_SETTINGS_CATEGORY.GENERAL]: [
    PROJECT_SETTINGS["general"],
    PROJECT_SETTINGS["members"],
    PROJECT_SETTINGS["features"],
  ],
  [PROJECT_SETTINGS_CATEGORY.WORK_STRUCTURE]: [
    PROJECT_SETTINGS["states"],
    PROJECT_SETTINGS["labels"],
    PROJECT_SETTINGS["estimates"],
    PROJECT_SETTINGS["epics"],
    PROJECT_SETTINGS["work-item-types"],
    PROJECT_SETTINGS["templates"],
  ],
  [PROJECT_SETTINGS_CATEGORY.EXECUTION]: [
    PROJECT_SETTINGS["workflows"],
    PROJECT_SETTINGS["automations"],
    PROJECT_SETTINGS["project_updates"],
    PROJECT_SETTINGS["recurring_work_items"],
  ],
};
