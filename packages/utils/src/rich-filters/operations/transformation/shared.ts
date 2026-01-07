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

import type { TFilterGroupNode, TFilterProperty } from "@plane/types";
import { processGroupNode } from "../../types/shared";
import { transformGroupWithChildren } from "./core";
import type { TTreeTransformFn, TTreeTransformResult } from "./core";
import { transformNotGroup } from "./extended";

/**
 * Transforms groups by processing children.
 * Handles AND/OR groups with children and NOT groups with single child.
 * @param group - The group to transform
 * @param transformFn - The transformation function
 * @returns The transformation result
 */
export const transformGroup = <P extends TFilterProperty>(
  group: TFilterGroupNode<P>,
  transformFn: TTreeTransformFn<P>
): TTreeTransformResult<P> =>
  processGroupNode(group, {
    onNotGroup: (notGroup) => transformNotGroup(notGroup, transformFn),
    onAndGroup: (andGroup) => transformGroupWithChildren(andGroup, transformFn),
    onOrGroup: (orGroup) => transformGroupWithChildren(orGroup, transformFn),
  });
