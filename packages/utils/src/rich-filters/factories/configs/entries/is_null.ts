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

// plane imports
import { EQUALITY_OPERATOR } from "@plane/types";
// local imports
import { getWithValueConfig } from "../extended";
import type { TCreateFilterConfigParams } from "../shared";
import { createOperatorConfigEntry } from "../shared";

/**
 * Helper to get the ISNULL operator config entry
 * @param params - The filter params
 * @returns The ISNULL operator config entry
 */
export const getIsNullOperatorConfigEntry = <P extends TCreateFilterConfigParams>(params: P) =>
  createOperatorConfigEntry(EQUALITY_OPERATOR.ISNULL, params, (updatedParams) =>
    getWithValueConfig({
      ...updatedParams,
      value: true, // always true for ISNULL operator
      allowNegative: false, // ISNULL operator does not support negation for now
    })
  );
