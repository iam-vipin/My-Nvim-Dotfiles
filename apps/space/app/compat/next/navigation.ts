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

import { useMemo } from "react";
import { useLocation, useNavigate, useParams as useParamsRR, useSearchParams as useSearchParamsRR } from "react-router";
import { ensureTrailingSlash } from "./helper";

export function useRouter() {
  const navigate = useNavigate();
  return useMemo(
    () => ({
      push: (to: string) => navigate(ensureTrailingSlash(to)),
      replace: (to: string) => navigate(ensureTrailingSlash(to), { replace: true }),
      back: () => navigate(-1),
      forward: () => navigate(1),
      refresh: () => {
        location.reload();
      },
      prefetch: async (_to: string) => {
        // no-op in this shim
      },
    }),
    [navigate]
  );
}

export function usePathname(): string {
  const { pathname } = useLocation();
  return pathname;
}

export function useSearchParams(): URLSearchParams {
  const [searchParams] = useSearchParamsRR();
  return searchParams;
}

export function useParams() {
  return useParamsRR();
}
