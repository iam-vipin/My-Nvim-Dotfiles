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

import { DEFAULT_AUTOMATION_CONDITION_CONFIG } from "@plane/constants";
import type { TCreateConditionPayload } from "@plane/types";
import { EConditionNodeHandlerName } from "@plane/types";

type TGenerateConditionPayload = {
  triggerHandlerName?: string;
  conditionPayload?: Partial<TCreateConditionPayload>;
};

export const generateConditionPayload = ({ triggerHandlerName, conditionPayload }: TGenerateConditionPayload) => ({
  name: conditionPayload?.name ?? `Condition_${triggerHandlerName || "Unknown"}_${new Date().toISOString()}`,
  handler_name: conditionPayload?.handler_name ?? EConditionNodeHandlerName.JSON_FILTER,
  config: conditionPayload?.config ?? DEFAULT_AUTOMATION_CONDITION_CONFIG,
});
