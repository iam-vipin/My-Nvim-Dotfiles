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

import React from "react";
import AnalyticsWrapper from "../analytics-wrapper";
import TotalInsights from "../total-insights";
import CreatedVsResolved from "./created-vs-resolved";
import CustomizedInsights from "./customized-insights";
import WorkItemsInsightTable from "./workitems-insight-table";

function WorkItems() {
  return (
    <AnalyticsWrapper i18nTitle="sidebar.work_items">
      <div className="flex flex-col gap-14">
        <TotalInsights analyticsType="work-items" />
        <CreatedVsResolved />
        <CustomizedInsights />
        <WorkItemsInsightTable />
      </div>
    </AnalyticsWrapper>
  );
}

export { WorkItems };
