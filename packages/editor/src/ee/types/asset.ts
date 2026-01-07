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

// local imports
import type { ADDITIONAL_EXTENSIONS } from "../constants/extensions";

export type TEditorAttachmentAsset = {
  href: string;
  id: string;
  name: string;
  size: number;
  src: string;
  type: ADDITIONAL_EXTENSIONS.ATTACHMENT;
};

export type TAdditionalEditorAsset = TEditorAttachmentAsset;
