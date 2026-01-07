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

import type { FieldError, FieldValues } from "react-hook-form";

/**
 * Get a nested error from a form's errors object
 * @param errors - The form's errors object
 * @param path - The path to the error
 * @returns The error or undefined if not found
 */
export const getNestedError = <T extends FieldValues>(errors: T, path: string): FieldError | undefined => {
  const keys = path.split(".");
  let current: unknown = errors;

  for (const key of keys) {
    if (current && typeof current === "object" && key in current) {
      current = (current as Record<string, unknown>)[key];
    } else {
      return undefined;
    }
  }

  // Check if the final value is a FieldError
  if (current && typeof current === "object" && "message" in current) {
    return current as FieldError;
  }

  return undefined;
};
