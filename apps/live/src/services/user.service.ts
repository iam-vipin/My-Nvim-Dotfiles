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

// types
import { logger } from "@plane/logger";
import type { IUser } from "@plane/types";
// services
import { AppError } from "@/lib/errors";
import { APIService } from "@/services/api.service";

export class UserService extends APIService {
  constructor() {
    super();
  }

  currentUserConfig() {
    return {
      url: `${this.baseURL}/api/users/me/`,
    };
  }

  async currentUser(cookie: string): Promise<IUser> {
    return this.get("/api/users/me/", {
      headers: {
        Cookie: cookie,
      },
    })
      .then((response) => response?.data)
      .catch((error) => {
        const appError = new AppError(error, {
          context: { operation: "currentUser" },
        });
        logger.error("Failed to fetch current user", appError);
        throw appError;
      });
  }
}
