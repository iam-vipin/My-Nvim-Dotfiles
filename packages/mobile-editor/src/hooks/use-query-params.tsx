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

type QueryParams<T extends string> = {
  [key in T]: string;
};

export function useQueryParams<T extends string>(paramNames: Array<T>): QueryParams<T> {
  return useMemo(() => {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);

    const params = {} as QueryParams<T>;
    paramNames.forEach((name) => {
      params[name] = urlParams.get(name) ?? "";
    });

    return params;
  }, [paramNames]);
}

export default useQueryParams;
