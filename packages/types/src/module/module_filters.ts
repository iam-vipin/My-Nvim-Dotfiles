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

export type TModuleOrderByOptions =
  | "name"
  | "-name"
  | "progress"
  | "-progress"
  | "issues_length"
  | "-issues_length"
  | "target_date"
  | "-target_date"
  | "created_at"
  | "-created_at"
  | "sort_order";

export type TModuleLayoutOptions = "list" | "board" | "gantt";

export type TModuleDisplayFilters = {
  favorites?: boolean;
  layout?: TModuleLayoutOptions;
  order_by?: TModuleOrderByOptions;
};

export type TModuleFilters = {
  lead?: string[] | null;
  members?: string[] | null;
  start_date?: string[] | null;
  status?: string[] | null;
  target_date?: string[] | null;
};

export type TModuleFiltersByState = {
  default: TModuleFilters;
  archived: TModuleFilters;
};

export type TModuleStoredFilters = {
  display_filters?: TModuleDisplayFilters;
  filters?: TModuleFilters;
};
