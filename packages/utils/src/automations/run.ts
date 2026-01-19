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

import { EAutomationRunStatus } from "@plane/types";

/**
 * Get the label for the automation run status
 * @param runStatus - The status of the automation run
 * @returns The label for the automation run status
 */
export const getAutomationRunStatusLabel = (runStatus: EAutomationRunStatus) => {
  switch (runStatus) {
    case EAutomationRunStatus.PENDING:
      return "Pending";
    case EAutomationRunStatus.RUNNING:
      return "Running";
    case EAutomationRunStatus.SUCCESS:
      return "Success";
    case EAutomationRunStatus.FAILED:
      return "Failed";
    case EAutomationRunStatus.CANCELLED:
      return "Cancelled";
  }
};
