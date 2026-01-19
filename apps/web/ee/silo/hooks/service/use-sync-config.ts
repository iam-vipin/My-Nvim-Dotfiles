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
import type { TServiceAuthConfiguration, TImporterKeys } from "@plane/etl/core";
import { CredentialService } from "@plane/etl/core";
// silo hooks
import { useBaseImporter } from "@/plane-web/silo/hooks";

type TUseSyncConfig = {
  data: TServiceAuthConfiguration | undefined;
  isLoading: boolean;
  error: Error | undefined;
  mutate: (data?: TServiceAuthConfiguration) => Promise<TServiceAuthConfiguration | undefined>;
};

export const useSyncConfig = (service: TImporterKeys): TUseSyncConfig => {
  // hooks
  const { workspaceId, userId, siloBaseUrl } = useBaseImporter();
  // service instance
  const syncService = new CredentialService(siloBaseUrl);
  // states
  const [config, setConfig] = useState<TServiceAuthConfiguration | undefined>(undefined);

  // fetch service config
  const { data, isLoading, error, mutate } = useSWR(
    siloBaseUrl ? `IMPORTER_CONFIG_${workspaceId}_${userId}_${service}` : null,
    siloBaseUrl ? async () => await syncService.isServiceConfigured(workspaceId, userId, service) : null
  );

  // update the config
  useEffect(() => {
    if ((!config && data) || (config && data && config.isAuthenticated !== data.isAuthenticated)) {
      setConfig(data);
    }
  }, [data]);

  return {
    data: config,
    isLoading,
    error,
    mutate,
  };
};
