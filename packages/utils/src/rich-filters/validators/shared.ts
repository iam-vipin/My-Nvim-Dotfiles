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

// plane imports
import type { TFilterGroupNode, TFilterProperty } from "@plane/types";
// local imports
import { isNotGroupNode } from "../types/extended";
import { getGroupChildren } from "../types/shared";

/**
 * Determines if a group should be unwrapped based on the number of children and group type.
 * @param group - The group node to check
 * @param preserveNotGroups - Whether to preserve NOT groups even with single children
 * @returns True if the group should be unwrapped, false otherwise
 */
export const shouldUnwrapGroup = <P extends TFilterProperty>(group: TFilterGroupNode<P>, preserveNotGroups = true) => {
  const children = getGroupChildren(group);

  // Never unwrap groups with multiple children
  if (children.length !== 1) {
    return false;
  }

  // If preserveNotGroups is true, don't unwrap NOT groups
  if (preserveNotGroups && isNotGroupNode(group)) {
    return false;
  }

  // Unwrap AND/OR groups with single children, and NOT groups if preserveNotGroups is false
  return true;
};
