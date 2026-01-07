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

export enum E_BULK_OPERATION_ERROR_CODES {
  "INVALID_ARCHIVE_STATE_GROUP" = 4091,
  "INVALID_ISSUE_START_DATE" = 4101,
  "INVALID_ISSUE_TARGET_DATE" = 4102,
  "INVALID_STATE_TRANSITION" = 4103,
}

export const BULK_OPERATION_ERROR_DETAILS: {
  [key in E_BULK_OPERATION_ERROR_CODES]: {
    i18n_title: string;
    i18n_message: string;
  };
} = {
  [E_BULK_OPERATION_ERROR_CODES.INVALID_ARCHIVE_STATE_GROUP]: {
    i18n_title: "bulk_operations.error_details.invalid_archive_state_group.title",
    i18n_message: "bulk_operations.error_details.invalid_archive_state_group.message",
  },
  [E_BULK_OPERATION_ERROR_CODES.INVALID_ISSUE_START_DATE]: {
    i18n_title: "bulk_operations.error_details.invalid_issue_start_date.title",
    i18n_message: "bulk_operations.error_details.invalid_issue_start_date.message",
  },
  [E_BULK_OPERATION_ERROR_CODES.INVALID_ISSUE_TARGET_DATE]: {
    i18n_title: "bulk_operations.error_details.invalid_issue_target_date.title",
    i18n_message: "bulk_operations.error_details.invalid_issue_target_date.message",
  },
  [E_BULK_OPERATION_ERROR_CODES.INVALID_STATE_TRANSITION]: {
    i18n_title: "bulk_operations.error_details.invalid_state_transition.title",
    i18n_message: "bulk_operations.error_details.invalid_state_transition.message",
  },
};
