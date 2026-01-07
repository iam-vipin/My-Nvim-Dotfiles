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

import type { FC, SyntheticEvent } from "react";
import React from "react";
// plane imports
import { observer } from "mobx-react";
import { usePlatformOS } from "@plane/hooks";
import { useTranslation } from "@plane/i18n";
import { CustomerRequestIcon, CustomersIcon } from "@plane/propel/icons";
import { Tooltip } from "@plane/propel/tooltip";
// components
import type { TWorkItemLayoutAdditionalProperties } from "@/ce/components/issues/issue-layouts/additional-properties";
import { WithDisplayPropertiesHOC } from "@/components/issues/issue-layouts/properties/with-display-properties-HOC";
import { useCustomers } from "@/plane-web/hooks/store";

export const WorkItemLayoutAdditionalProperties = observer(function WorkItemLayoutAdditionalProperties(
  props: TWorkItemLayoutAdditionalProperties
) {
  const { displayProperties, issue } = props;
  // i18n
  const { t } = useTranslation();
  // hooks
  const { isMobile } = usePlatformOS();
  const {
    isCustomersFeatureEnabled,
    workItems: { getCustomerCountByWorkItemId },
  } = useCustomers();

  const customerCount = getCustomerCountByWorkItemId(issue.id);

  const handleEventPropagation = (e: SyntheticEvent<HTMLDivElement>) => {
    e.stopPropagation();
    e.preventDefault();
  };

  return (
    <>
      {/* Customer Request Count */}
      <WithDisplayPropertiesHOC
        displayProperties={displayProperties}
        displayPropertyKey="customer_request_count"
        shouldRenderProperty={(properties) =>
          !!properties.customer_request_count && !!issue.customer_request_ids?.length && !!isCustomersFeatureEnabled
        }
      >
        <Tooltip
          tooltipHeading={t("issue.display.properties.customer_request_count")}
          tooltipContent={`${issue.customer_request_ids?.length ?? 0}`}
          isMobile={isMobile}
          renderByDefault={false}
        >
          <div
            className="flex h-5 flex-shrink-0 items-center justify-center gap-2 overflow-hidden rounded-sm border-[0.5px] border-subtle-1 px-2.5 py-1"
            onFocus={handleEventPropagation}
            onClick={handleEventPropagation}
          >
            <CustomerRequestIcon className="h-3 w-3 flex-shrink-0" strokeWidth={2} />
            <div className="text-11">{issue.customer_request_ids?.length ?? 0}</div>
          </div>
        </Tooltip>
      </WithDisplayPropertiesHOC>
      {/* Customer Count */}
      <WithDisplayPropertiesHOC
        displayProperties={displayProperties}
        displayPropertyKey="customer_count"
        shouldRenderProperty={(properties) =>
          !!properties.customer_count && !!customerCount && !!isCustomersFeatureEnabled
        }
      >
        <Tooltip
          tooltipHeading={t("issue.display.properties.customer_count")}
          tooltipContent={`${customerCount}`}
          isMobile={isMobile}
          renderByDefault={false}
        >
          <div
            className="flex h-5 flex-shrink-0 items-center justify-center gap-2 overflow-hidden rounded-sm border-[0.5px] border-subtle-1 px-2.5 py-1"
            onFocus={handleEventPropagation}
            onClick={handleEventPropagation}
          >
            <CustomersIcon className="h-3 w-3 flex-shrink-0" strokeWidth={2} />
            <div className="text-11">{customerCount}</div>
          </div>
        </Tooltip>
      </WithDisplayPropertiesHOC>
    </>
  );
});
