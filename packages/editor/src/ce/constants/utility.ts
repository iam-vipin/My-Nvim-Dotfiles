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
import type { ADDITIONAL_EXTENSIONS } from "@plane/utils";
import { CORE_EXTENSIONS } from "@plane/utils";
// plane editor imports
import type { ExtensionFileSetStorageKey } from "@/plane-editor/types/storage";

export type NodeFileMapType = Partial<
  Record<
    CORE_EXTENSIONS | ADDITIONAL_EXTENSIONS,
    {
      fileSetName: ExtensionFileSetStorageKey;
    }
  >
>;

export const NODE_FILE_MAP: NodeFileMapType = {
  [CORE_EXTENSIONS.IMAGE]: {
    fileSetName: "deletedImageSet",
  },
  [CORE_EXTENSIONS.CUSTOM_IMAGE]: {
    fileSetName: "deletedImageSet",
  },
};
