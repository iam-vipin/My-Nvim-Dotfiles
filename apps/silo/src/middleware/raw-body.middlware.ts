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

import type { Request, Response } from "express";

export const setRawBodyOnRequest = (req: Request, res: Response, buf: Buffer) => {
  // added this to set rawBody on the request
  // this is used to verify the request signature in the slack auth middleware
  (req as any).rawBody = buf.toString();
};
