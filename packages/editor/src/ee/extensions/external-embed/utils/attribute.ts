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

import type { TExternalEmbedBlockAttributes } from "@/types";
import { EExternalEmbedAttributeNames, EExternalEmbedEntityType } from "@/types";

export const DEFAULT_EXTERNAL_EMBED_ATTRIBUTES: TExternalEmbedBlockAttributes = {
  [EExternalEmbedAttributeNames.SOURCE]: null,
  [EExternalEmbedAttributeNames.ID]: null,
  [EExternalEmbedAttributeNames.EMBED_DATA]: null,
  [EExternalEmbedAttributeNames.IS_RICH_CARD]: false,
  [EExternalEmbedAttributeNames.HAS_EMBED_FAILED]: false,
  [EExternalEmbedAttributeNames.ENTITY_NAME]: null,
  [EExternalEmbedAttributeNames.ENTITY_TYPE]: EExternalEmbedEntityType.EMBED,
  [EExternalEmbedAttributeNames.HAS_TRIED_EMBEDDING]: false,
};
