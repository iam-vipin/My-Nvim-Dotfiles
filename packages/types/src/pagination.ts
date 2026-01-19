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

// Generic paginated response type for API responses
export type TPaginatedResponse<T> = {
  results: T;
  grouped_by?: string | null;
  sub_grouped_by?: string | null;
  total_count?: number;
  next_cursor?: string;
  prev_cursor?: string;
  next_page_results?: boolean;
  prev_page_results?: boolean;
  count?: number;
  total_pages?: number;
  total_results?: number;
  extra_stats?: string | null;
};
