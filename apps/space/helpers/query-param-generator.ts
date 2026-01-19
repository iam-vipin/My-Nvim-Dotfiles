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

type TQueryParamValue = string | string[] | boolean | number | bigint | undefined | null;

export const queryParamGenerator = (queryObject: Record<string, TQueryParamValue>) => {
  const queryParamObject: Record<string, TQueryParamValue> = {};
  const queryParam = new URLSearchParams();

  Object.entries(queryObject).forEach(([key, value]) => {
    if (typeof value === "number" || typeof value === "bigint" || typeof value === "boolean") {
      queryParamObject[key] = value;
      queryParam.append(key, value.toString());
    } else if (typeof value === "string" && value.length > 0) {
      queryParamObject[key] = value.split(",");
      queryParam.append(key, value);
    } else if (Array.isArray(value) && value.length > 0) {
      queryParamObject[key] = value;
      queryParam.append(key, value.toString());
    }
  });

  return {
    query: queryParamObject,
    queryParam: queryParam.toString(),
  };
};
