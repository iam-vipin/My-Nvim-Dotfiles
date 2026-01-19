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

import type { LinearProps } from "./api.service";
import LinearService from "./api.service";
import { LinearAuth } from "./auth.service";

export const createLinearAuthService = (
  clientId: string = "",
  clientSecret: string = "",
  callbackURL: string
): LinearAuth => {
  if (!clientId || !clientSecret) {
    console.error("[LINEAR] Client ID and client secret are required");
  }
  return new LinearAuth({
    clientId,
    clientSecret,
    callbackURL,
  });
};

export const createLinearService = (props: LinearProps): LinearService => new LinearService(props);
