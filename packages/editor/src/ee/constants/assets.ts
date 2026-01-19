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

// helpers
import type { TAssetMetaDataRecord } from "@/helpers/assets";
// local imports
import type { TAttachmentBlockAttributes } from "../extensions/attachments/types";
import { EAttachmentBlockAttributeNames } from "../extensions/attachments/types";
import { getAttachmentBlockId } from "../extensions/attachments/utils";
import { ADDITIONAL_EXTENSIONS } from "./extensions";

export const ADDITIONAL_ASSETS_META_DATA_RECORD: Partial<Record<ADDITIONAL_EXTENSIONS, TAssetMetaDataRecord>> = {
  [ADDITIONAL_EXTENSIONS.ATTACHMENT]: (attrs) => {
    const attachmentBlockAttrs = attrs as TAttachmentBlockAttributes;
    if (!attachmentBlockAttrs[EAttachmentBlockAttributeNames.SOURCE]) return;
    const assetSize = Number(attachmentBlockAttrs[EAttachmentBlockAttributeNames.FILE_SIZE] ?? 0);

    return {
      href: `#${getAttachmentBlockId(attachmentBlockAttrs[EAttachmentBlockAttributeNames.ID] ?? "")}`,
      id: attachmentBlockAttrs[EAttachmentBlockAttributeNames.ID] ?? "",
      name: attachmentBlockAttrs[EAttachmentBlockAttributeNames.FILE_NAME] ?? "",
      size: isNaN(assetSize) ? 0 : assetSize,
      src: attachmentBlockAttrs[EAttachmentBlockAttributeNames.SOURCE],
      type: ADDITIONAL_EXTENSIONS.ATTACHMENT,
    };
  },
};
