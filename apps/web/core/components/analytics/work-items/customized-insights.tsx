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

import { observer } from "mobx-react";
import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";
// plane package imports
import { useTranslation } from "@plane/i18n";
import type { IAnalyticsParams } from "@plane/types";
import { ChartXAxisProperty, ChartYAxisMetric } from "@plane/types";
import { cn } from "@plane/utils";
// plane web components
import AnalyticsSectionWrapper from "../analytics-section-wrapper";
import { AnalyticsSelectParams } from "../select/analytics-params";
import PriorityChart from "./priority-chart";

const CustomizedInsights = observer(function CustomizedInsights({
  peekView,
  isEpic,
}: {
  peekView?: boolean;
  isEpic?: boolean;
}) {
  const { t } = useTranslation();
  const { workspaceSlug } = useParams();
  const { control, watch, setValue } = useForm<IAnalyticsParams>({
    defaultValues: {
      x_axis: ChartXAxisProperty.PRIORITY,
      y_axis: isEpic ? ChartYAxisMetric.EPIC_WORK_ITEM_COUNT : ChartYAxisMetric.WORK_ITEM_COUNT,
    },
  });

  const params = {
    x_axis: watch("x_axis"),
    y_axis: watch("y_axis"),
    group_by: watch("group_by"),
  };

  return (
    <AnalyticsSectionWrapper
      title={t("workspace_analytics.customized_insights")}
      className="col-span-1"
      headerClassName={cn(peekView ? "flex-col items-start" : "")}
      actions={
        <AnalyticsSelectParams
          control={control}
          setValue={setValue}
          params={params}
          workspaceSlug={workspaceSlug.toString()}
          isEpic={isEpic}
        />
      }
    >
      <PriorityChart x_axis={params.x_axis} y_axis={params.y_axis} group_by={params.group_by} />
    </AnalyticsSectionWrapper>
  );
});

export default CustomizedInsights;
