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

import "reflect-metadata";

export function throws(errors: string[]) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
      const stack = new Error().stack;
      const callerLine = stack?.split("\n")[2];
      // console.log(stack)

      // if (!callerLine?.includes("try")) {
      //   console.warn(
      //     `Warning: ${propertyKey} should be called within a try-catch block. Possible errors: ${errors.join(", ")}`
      //   )
      // }

      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
}
