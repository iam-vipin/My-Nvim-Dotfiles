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

import { useEffect, useState } from "react";
import useSWR from "swr";
// silo services
import apiTokenService from "@/plane-web/silo/services/api-service-token.service";

export const useApiServiceToken = (workspaceSlug: string): any => {
  // state
  const [token, setToken] = useState<string | undefined>(undefined);

  // fetch service token
  const { data, isLoading, error, mutate } = useSWR(
    workspaceSlug ? `SERVICE_API_TOKEN_${workspaceSlug}` : null,
    workspaceSlug ? async () => await apiTokenService.createServiceApiToken(workspaceSlug) : null,
    { revalidateOnFocus: true, revalidateOnReconnect: true }
  );

  // update the token
  useEffect(() => {
    if ((!token && data) || (token && data && token !== data.token)) {
      setToken(data.token);
    }
  }, [data, token]);

  return {
    data: token,
    isLoading,
    error,
    mutate,
  };
};
