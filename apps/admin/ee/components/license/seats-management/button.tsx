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

import { useState } from "react";
import { observer } from "mobx-react";
// plane imports
import { Button } from "@plane/propel/button";
import { ChevronDownIcon } from "@plane/propel/icons";
import type { TProductSubscription, TProrationPreview } from "@plane/types";
import { CustomMenu } from "@plane/ui";
// local imports
import { AddSeatsModal } from "./add-seats/modal";
import { RemoveUnusedSeatsModal } from "./remove-seats/modal";

type TSeatsManagementButton = {
  fetchProrationPreviewService: (quantity: number) => Promise<TProrationPreview>;
  getIsInTrialPeriod: (checkForUpgrade: boolean) => boolean;
  removeUnusedSeatsService: () => Promise<{ seats: number }>;
  subscriptionDetail: TProductSubscription;
  subscriptionLevel: "workspace" | "instance";
  updateSeatsService: (quantity: number) => Promise<{ seats: number }>;
  updateSubscriptionDetail: (payload: Partial<TProductSubscription>) => void;
};

export const SeatsManagementButton = observer(function SeatsManagementButton(props: TSeatsManagementButton) {
  const {
    fetchProrationPreviewService,
    getIsInTrialPeriod,
    removeUnusedSeatsService,
    subscriptionDetail,
    subscriptionLevel,
    updateSeatsService,
    updateSubscriptionDetail,
  } = props;
  // states
  const [isAddSeatsModalOpen, setIsAddSeatsModalOpen] = useState(false);
  const [isRemoveUnusedSeatsConfirmationModalOpen, setIsRemoveUnusedSeatsConfirmationModalOpen] = useState(false);

  return (
    <>
      <AddSeatsModal
        fetchProrationPreviewService={fetchProrationPreviewService}
        getIsInTrialPeriod={getIsInTrialPeriod}
        isOpen={isAddSeatsModalOpen}
        onClose={() => setIsAddSeatsModalOpen(false)}
        subscriptionDetail={subscriptionDetail}
        subscriptionLevel={subscriptionLevel}
        updateSeatsService={updateSeatsService}
        updateSubscriptionDetail={updateSubscriptionDetail}
      />
      <RemoveUnusedSeatsModal
        handleClose={() => setIsRemoveUnusedSeatsConfirmationModalOpen(false)}
        isOpen={isRemoveUnusedSeatsConfirmationModalOpen}
        removeUnusedSeatsService={removeUnusedSeatsService}
        subscriptionLevel={subscriptionLevel}
        updateSubscriptionDetail={updateSubscriptionDetail}
      />
      <CustomMenu
        customButton={
          <Button variant="secondary" size="lg" appendIcon={<ChevronDownIcon />}>
            Manage seats
          </Button>
        }
        placement="bottom-end"
        closeOnSelect
      >
        <CustomMenu.MenuItem
          onClick={() => {
            setIsAddSeatsModalOpen(true);
          }}
        >
          Add seats
        </CustomMenu.MenuItem>
        <CustomMenu.MenuItem
          onClick={() => {
            setIsRemoveUnusedSeatsConfirmationModalOpen(true);
          }}
        >
          Remove unused seats
        </CustomMenu.MenuItem>
      </CustomMenu>
    </>
  );
});
