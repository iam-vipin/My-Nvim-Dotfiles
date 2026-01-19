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

import { useRef, useEffect } from "react";
import useSWR from "swr";
// plane imports
import { UserService } from "@plane/services";
import type { IUser } from "@plane/types";

export const useMention = () => {
  const userService = new UserService();
  const { data: user, isLoading: userDataLoading } = useSWR("currentUser", async () => userService.me());

  const userRef = useRef<IUser | undefined>();

  useEffect(() => {
    if (userRef) {
      userRef.current = user;
    }
  }, [user]);

  const waitForUserDate = async () =>
    new Promise<IUser>((resolve) => {
      const checkData = () => {
        if (userRef.current) {
          resolve(userRef.current);
        } else {
          setTimeout(checkData, 100);
        }
      };
      checkData();
    });

  const mentionHighlights = async () => {
    if (!userDataLoading && userRef.current) {
      return [userRef.current.id];
    } else {
      const user = await waitForUserDate();
      return [user.id];
    }
  };

  return {
    mentionHighlights,
  };
};
