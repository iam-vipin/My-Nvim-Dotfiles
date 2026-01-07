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

import { AxiosError } from "axios";
import type { TSSOErrorCodes } from "@plane/constants";

export function isSSOError(
  error: unknown
): error is AxiosError & { response: { data: { error_code: TSSOErrorCodes; error_message: string } } } {
  return !!(
    error instanceof AxiosError &&
    "response" in error &&
    error.response &&
    "data" in error.response &&
    "error_code" in error.response.data &&
    "error_message" in error.response.data
  );
}
