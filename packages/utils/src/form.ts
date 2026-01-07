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

import { set } from "lodash-es";

export function getChangedFields<T extends Record<string, unknown>>(
  formData: Partial<T>,
  dirtyFields: Partial<Record<Extract<keyof T, string>, boolean | undefined>>
): Partial<T> {
  const changedFields: Partial<T> = {};

  const dirtyFieldKeys = Object.keys(dirtyFields) as Array<Extract<keyof T, string>>;
  for (const dirtyField of dirtyFieldKeys) {
    if (dirtyFields[dirtyField]) {
      set(changedFields as Record<string, unknown>, [dirtyField], formData[dirtyField]);
    }
  }

  return changedFields;
}
