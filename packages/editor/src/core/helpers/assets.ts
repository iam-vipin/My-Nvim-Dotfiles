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

import type { Node as ProseMirrorNode } from "@tiptap/pm/model";
// plane imports
import type { ADDITIONAL_EXTENSIONS } from "@plane/utils";
import { CORE_EXTENSIONS } from "@plane/utils";
// extensions
import { getImageBlockId } from "@/extensions/custom-image/utils";
// plane editor imports
import { ADDITIONAL_ASSETS_META_DATA_RECORD } from "@/plane-editor/constants/assets";
// types
import type { TEditorAsset } from "@/types";

export type TAssetMetaDataRecord = (attrs: ProseMirrorNode["attrs"]) => TEditorAsset | undefined;

export const CORE_ASSETS_META_DATA_RECORD: Partial<
  Record<CORE_EXTENSIONS | ADDITIONAL_EXTENSIONS, TAssetMetaDataRecord>
> = {
  [CORE_EXTENSIONS.IMAGE]: (attrs) => {
    if (!attrs?.src) return;
    return {
      href: `#${getImageBlockId(attrs?.id ?? "")}`,
      id: attrs?.id,
      name: `image-${attrs?.id}`,
      size: 0,
      src: attrs?.src,
      type: CORE_EXTENSIONS.IMAGE,
    };
  },
  [CORE_EXTENSIONS.CUSTOM_IMAGE]: (attrs) => {
    if (!attrs?.src) return;
    return {
      href: `#${getImageBlockId(attrs?.id ?? "")}`,
      id: attrs?.id,
      name: `image-${attrs?.id}`,
      size: 0,
      src: attrs?.src,
      type: CORE_EXTENSIONS.CUSTOM_IMAGE,
    };
  },
  ...ADDITIONAL_ASSETS_META_DATA_RECORD,
};
