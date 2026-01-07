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

export type TCycleTabOptions = "active" | "all";

export type TCycleLayoutOptions = "list" | "board" | "gantt";

export type TCycleDisplayFilters = {
  active_tab?: TCycleTabOptions;
  layout?: TCycleLayoutOptions;
};

export type TCycleFilters = {
  end_date?: string[] | null;
  start_date?: string[] | null;
  status?: string[] | null;
};

export type TCycleFiltersByState = {
  default: TCycleFilters;
  archived: TCycleFilters;
};

export type TCycleStoredFilters = {
  display_filters?: TCycleDisplayFilters;
  filters?: TCycleFilters;
};
