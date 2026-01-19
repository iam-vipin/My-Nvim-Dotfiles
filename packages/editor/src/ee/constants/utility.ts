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

// ce imports
import { NODE_FILE_MAP as CORE_NODE_FILE_MAP } from "src/ce/constants/utility";
import type { NodeFileMapType } from "src/ce/constants/utility";
// local imports
import { ADDITIONAL_EXTENSIONS } from "./extensions";

export const NODE_FILE_MAP: NodeFileMapType = {
  ...CORE_NODE_FILE_MAP,
  [ADDITIONAL_EXTENSIONS.ATTACHMENT]: {
    fileSetName: "deletedAttachmentSet",
  },
};
