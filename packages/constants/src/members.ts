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

// Member property constants - Single source of truth for member spreadsheet properties

export type TMemberOrderByOptions =
  | "display_name"
  | "-display_name"
  | "full_name"
  | "-full_name"
  | "email"
  | "-email"
  | "joining_date"
  | "-joining_date"
  | "role"
  | "-role";

export interface IProjectMemberDisplayProperties {
  full_name: boolean;
  display_name: boolean;
  email: boolean;
  joining_date: boolean;
  role: boolean;
}

export const MEMBER_PROPERTY_DETAILS: {
  [key in keyof IProjectMemberDisplayProperties]: {
    i18n_title: string;
    ascendingOrderKey: TMemberOrderByOptions;
    ascendingOrderTitle: string;
    descendingOrderKey: TMemberOrderByOptions;
    descendingOrderTitle: string;
    iconName: string;
    isSortingAllowed: boolean;
  };
} = {
  full_name: {
    i18n_title: "project_members.full_name",
    ascendingOrderKey: "full_name",
    ascendingOrderTitle: "A",
    descendingOrderKey: "-full_name",
    descendingOrderTitle: "Z",
    iconName: "User",
    isSortingAllowed: true,
  },
  display_name: {
    i18n_title: "project_members.display_name",
    ascendingOrderKey: "display_name",
    ascendingOrderTitle: "A",
    descendingOrderKey: "-display_name",
    descendingOrderTitle: "Z",
    iconName: "User",
    isSortingAllowed: true,
  },
  email: {
    i18n_title: "project_members.email",
    ascendingOrderKey: "email",
    ascendingOrderTitle: "A",
    descendingOrderKey: "-email",
    descendingOrderTitle: "Z",
    iconName: "Mail",
    isSortingAllowed: true,
  },
  joining_date: {
    i18n_title: "project_members.joining_date",
    ascendingOrderKey: "joining_date",
    ascendingOrderTitle: "Old",
    descendingOrderKey: "-joining_date",
    descendingOrderTitle: "New",
    iconName: "Calendar",
    isSortingAllowed: true,
  },
  role: {
    i18n_title: "project_members.role",
    ascendingOrderKey: "role",
    ascendingOrderTitle: "Guest",
    descendingOrderKey: "-role",
    descendingOrderTitle: "Admin",
    iconName: "Shield",
    isSortingAllowed: true,
  },
};
