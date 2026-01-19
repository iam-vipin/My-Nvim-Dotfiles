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
import { EProductSubscriptionEnum } from "@plane/types";
import { renderFormattedDate } from "@plane/utils";
import { instanceManagementService } from "@plane/services";
// plane admin imports
import { InstanceLicenseActions } from "@/plane-admin/components/license/license-actions";
import { useInstanceManagement } from "@/plane-admin/hooks/store/use-instance-management";
// local imports
import { BasePlanCard } from "./base";
import { SeatsManagementButton } from "../seats-management/button";

export const EnterprisePlanCard = observer(function EnterprisePlanCard() {
  // store hooks
  const { instanceLicense, isInstanceSubscriptionManagementEnabled, updateInstanceSubscriptionDetail } =
    useInstanceManagement();
  // derived values
  const startDate = instanceLicense?.current_period_start_date;
  const endDate = instanceLicense?.current_period_end_date;
  const isSubscriptionCancelled = instanceLicense?.is_cancelled;
  const isOfflinePayment = instanceLicense?.is_offline_payment;
  const purchasedSeats = instanceLicense?.purchased_seats;

  return (
    <BasePlanCard
      planVariant={EProductSubscriptionEnum.ENTERPRISE}
      planDescription={
        <>
          <div className="text-body-xs-medium text-secondary">
            Everything in Business + LDAP, Granular Access Controls, Private + managed deploys, region-locked data
            governance, unlimited version histories, custom storage limits, and all integrations.
          </div>
          {!isOfflinePayment ? (
            <>
              {isSubscriptionCancelled ? (
                <div className="text-body-xs-medium text-danger-secondary">
                  Your billing cycle ends on {renderFormattedDate(endDate)}.
                </div>
              ) : (
                <div className="text-body-xs-medium text-secondary">
                  {startDate
                    ? `Current billing cycle: ${renderFormattedDate(startDate)} - ${renderFormattedDate(endDate)}`
                    : `Your billing cycle renews on ${renderFormattedDate(endDate)}`}{" "}
                  • Billable seats: {purchasedSeats}
                </div>
              )}
            </>
          ) : (
            <div className="text-body-xs-medium text-secondary">
              To manage your subscription, please{" "}
              <a className="text-accent-primary hover:underline" href="mailto:support@plane.so">
                contact support.
              </a>
            </div>
          )}
          <InstanceLicenseActions />
        </>
      }
      button={
        instanceLicense &&
        isInstanceSubscriptionManagementEnabled && (
          <SeatsManagementButton
            fetchProrationPreviewService={(quantity) =>
              instanceManagementService.getEnterpriseLicenseProrationPreview(quantity)
            }
            getIsInTrialPeriod={() => false} // NOTE: Enterprise license doesn't have trial functionality
            removeUnusedSeatsService={() => instanceManagementService.removeEnterpriseLicenseUnusedSeats()}
            subscriptionDetail={instanceLicense}
            subscriptionLevel="instance"
            updateSeatsService={(quantity) => instanceManagementService.modifyEnterpriseLicenseSeats(quantity)}
            updateSubscriptionDetail={updateInstanceSubscriptionDetail}
          />
        )
      }
    />
  );
});
