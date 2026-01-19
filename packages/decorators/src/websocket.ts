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

/**
 * WebSocket method decorator
 * @param route
 * @returns
 */
export function WebSocket(route: string): MethodDecorator {
  return function (target: object, propertyKey: string | symbol) {
    Reflect.defineMetadata("method", "ws", target, propertyKey);
    Reflect.defineMetadata("route", route, target, propertyKey);
  };
}
