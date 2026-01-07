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

// icons
import { EUserPermissions } from "@plane/constants";
import { SettingIcon } from "@/components/icons/attachment";
// types
import type { Props } from "@/components/icons/types";
// constants

export const PROJECT_SETTINGS = {
  general: {
    key: "general",
    i18n_label: "common.general",
    href: ``,
    access: [EUserPermissions.ADMIN, EUserPermissions.MEMBER, EUserPermissions.GUEST],
    highlight: (pathname: string, baseUrl: string) => pathname === `${baseUrl}/`,
    Icon: SettingIcon,
  },
  members: {
    key: "members",
    i18n_label: "common.members",
    href: `/members`,
    access: [EUserPermissions.ADMIN, EUserPermissions.MEMBER, EUserPermissions.GUEST],
    highlight: (pathname: string, baseUrl: string) => pathname === `${baseUrl}/members/`,
    Icon: SettingIcon,
  },
  features: {
    key: "features",
    i18n_label: "common.features",
    href: `/features`,
    access: [EUserPermissions.ADMIN],
    highlight: (pathname: string, baseUrl: string) => pathname === `${baseUrl}/features/`,
    Icon: SettingIcon,
  },
  states: {
    key: "states",
    i18n_label: "common.states",
    href: `/states`,
    access: [EUserPermissions.ADMIN, EUserPermissions.MEMBER],
    highlight: (pathname: string, baseUrl: string) => pathname === `${baseUrl}/states/`,
    Icon: SettingIcon,
  },
  labels: {
    key: "labels",
    i18n_label: "common.labels",
    href: `/labels`,
    access: [EUserPermissions.ADMIN, EUserPermissions.MEMBER],
    highlight: (pathname: string, baseUrl: string) => pathname === `${baseUrl}/labels/`,
    Icon: SettingIcon,
  },
  estimates: {
    key: "estimates",
    i18n_label: "common.estimates",
    href: `/estimates`,
    access: [EUserPermissions.ADMIN],
    highlight: (pathname: string, baseUrl: string) => pathname === `${baseUrl}/estimates/`,
    Icon: SettingIcon,
  },
  automations: {
    key: "automations",
    i18n_label: "project_settings.automations.label",
    href: `/automations`,
    access: [EUserPermissions.ADMIN],
    highlight: (pathname: string, baseUrl: string) => pathname === `${baseUrl}/automations/`,
    Icon: SettingIcon,
  },
};

export const PROJECT_SETTINGS_LINKS: {
  key: string;
  i18n_label: string;
  href: string;
  access: EUserPermissions[];
  highlight: (pathname: string, baseUrl: string) => boolean;
  Icon: React.FC<Props>;
}[] = [
  PROJECT_SETTINGS["general"],
  PROJECT_SETTINGS["members"],
  PROJECT_SETTINGS["features"],
  PROJECT_SETTINGS["states"],
  PROJECT_SETTINGS["labels"],
  PROJECT_SETTINGS["estimates"],
  PROJECT_SETTINGS["automations"],
];
