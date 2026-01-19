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

/* ----------- Flatfile Types ----------- */
// Base type for field values
interface FieldValue<T> {
  value?: T;
  messages: any[];
  valid: boolean;
  updatedAt: string;
}

// Helper Types
type StringFieldValue = FieldValue<string>;
type ArrayFieldValue<T> = FieldValue<T[]>;

// Values object type
type TFlatfileRecordValue = {
  title: StringFieldValue;
  description: StringFieldValue;
  issue_type: FieldValue<unknown>;
  status: FieldValue<unknown>;
  priority: FieldValue<unknown>;
  assignee_email: FieldValue<unknown>;
  created_by_email: FieldValue<unknown>;
  created_at: FieldValue<unknown>;
  start_date: FieldValue<unknown>;
  target_date: FieldValue<unknown>;
  parent: FieldValue<unknown>;
  labels: ArrayFieldValue<string>;
  cycle: FieldValue<unknown>;
};

// Flatfile Record
export type TFlatfileRecord = {
  id: string;
  values: TFlatfileRecordValue;
  metadata: Record<string, unknown>;
  config: Record<string, unknown>;
  valid: boolean;
};

// Flatfile Sheet Payload
export type TFlatfileSheetPayload = {
  data: TFlatfileRecord[];
  success: boolean;
};
