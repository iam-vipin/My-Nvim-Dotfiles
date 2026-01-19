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

// hooks
import { useAppRouter } from "@/hooks/use-app-router";
// layouts
import { DevErrorComponent } from "./dev";
import { ProdErrorComponent } from "./prod";

export function CustomErrorComponent({ error }: { error: unknown }) {
  // router
  const router = useAppRouter();

  const handleGoHome = () => router.push("/");
  const handleReload = () => window.location.reload();

  if (import.meta.env.DEV) {
    return <DevErrorComponent error={error} onGoHome={handleGoHome} onReload={handleReload} />;
  }

  return <ProdErrorComponent onGoHome={handleGoHome} />;
}
