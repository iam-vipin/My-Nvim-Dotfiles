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

import { isEmpty } from "lodash-es";

export const storage = {
  set: (key: string, value: object | string | boolean): void => {
    if (typeof window === undefined || typeof window === "undefined" || !key || !value) return undefined;
    const tempValue: string | undefined = value
      ? ["string", "boolean"].includes(typeof value)
        ? value.toString()
        : isEmpty(value)
          ? undefined
          : JSON.stringify(value)
      : undefined;
    if (!tempValue) return undefined;
    window.localStorage.setItem(key, tempValue);
  },

  get: (key: string): string | undefined => {
    if (typeof window === undefined || typeof window === "undefined") return undefined;
    const item = window.localStorage.getItem(key);
    return item ? item : undefined;
  },

  remove: (key: string): void => {
    if (typeof window === undefined || typeof window === "undefined" || !key) return undefined;
    window.localStorage.removeItem(key);
  },
};
