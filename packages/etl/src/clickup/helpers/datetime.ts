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

export function getWaitTimeInMs(resetTimestamp: string): number {
  const resetTime = parseInt(resetTimestamp, 10) * 1000; // Convert to milliseconds
  const now = Date.now();
  const waitTime = resetTime - now;
  return Math.max(waitTime, 0); // Ensure we don't return negative wait times
}
