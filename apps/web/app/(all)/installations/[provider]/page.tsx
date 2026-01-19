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

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
// ui
import { LogoSpinner } from "@/components/common/logo-spinner";
// services
import { AppInstallationService } from "@/services/app_installation.service";
import type { Route } from "./+types/page";

// services
const appInstallationService = new AppInstallationService();

export default function AppPostInstallation({ params }: Route.ComponentProps) {
  // params
  const { provider } = params;
  // query params
  const searchParams = useSearchParams();
  const installation_id = searchParams.get("installation_id");
  const state = searchParams.get("state");
  const code = searchParams.get("code");

  useEffect(() => {
    if (provider === "github" && state && installation_id) {
      appInstallationService
        .addInstallationApp(state.toString(), provider, { installation_id })
        .then(() => {
          window.opener = null;
          window.open("", "_self");
          window.close();
        })
        .catch((err) => {
          console.log(err);
        });
    } else if (provider === "slack" && state && code) {
      const [workspaceSlug, projectId, integrationId] = state.toString().split(",");

      if (!projectId) {
        const payload = {
          code,
        };
        appInstallationService
          .addInstallationApp(state.toString(), provider, payload)
          .then(() => {
            window.opener = null;
            window.open("", "_self");
            window.close();
          })
          .catch((err) => {
            throw err?.response;
          });
      } else {
        const payload = {
          code,
        };
        appInstallationService
          .addSlackChannel(workspaceSlug, projectId, integrationId, payload)
          .then(() => {
            window.opener = null;
            window.open("", "_self");
            window.close();
          })
          .catch((err) => {
            throw err?.response;
          });
      }
    }
  }, [state, installation_id, provider, code]);

  return (
    <div className="absolute left-0 top-0 z-50 flex h-full w-full flex-col items-center justify-center gap-y-3 bg-layer-1">
      <h2 className="text-20 text-primary">Installing. Please wait...</h2>
      <LogoSpinner />
    </div>
  );
}
