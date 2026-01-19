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

/**
 * A type representing either a success (right) or failure (left) value
 */
export type Either<L, R> = { success: true; data: R } | { success: false; error: L };

/**
 * Creates a Right (success) Either value
 */
export function right<L, R>(value: R): Either<L, R> {
  return { success: true, data: value };
}

/**
 * Creates a Left (error) Either value
 */
export function left<L, R>(error: L): Either<L, R> {
  return { success: false, error };
}
