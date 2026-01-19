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

import { useCallback } from "react";
import { useSearchParams, usePathname } from "next/navigation";

type TParamsToAdd = {
  [key: string]: string;
};

export const useQueryParams = () => {
  // next navigation
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const updateQueryParams = useCallback(
    ({ paramsToAdd = {}, paramsToRemove = [] }: { paramsToAdd?: TParamsToAdd; paramsToRemove?: string[] }) => {
      const currentParams = new URLSearchParams(searchParams.toString());

      // add or update query parameters
      Object.keys(paramsToAdd).forEach((key) => {
        currentParams.set(key, paramsToAdd[key]);
      });

      // remove specified query parameters
      paramsToRemove.forEach((key) => {
        currentParams.delete(key);
      });

      // construct the new route with the updated query parameters
      const query = currentParams.toString();
      const newRoute = query ? `${pathname}?${query}` : pathname;
      return newRoute;
    },
    [pathname, searchParams]
  );

  return {
    updateQueryParams,
  };
};
