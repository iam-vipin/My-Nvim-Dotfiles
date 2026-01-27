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

import type { FC } from "react";
import { AttachmentPreviewListItem } from "./attachment-preview-list-item";

export type TAttachmentPreviewStatus = "uploading" | "uploaded";

export type TAttachmentPreviewItem = {
  id: string;
  name: string;
  size: number;
  extension: string;
  status: TAttachmentPreviewStatus;
  assetId?: string;
};

type TAttachmentPreviewListProps = {
  items: TAttachmentPreviewItem[];
};

export function AttachmentPreviewList({ items }: TAttachmentPreviewListProps) {
  if (!items.length) return null;

  return (
    <div className="mt-3 space-y-2">
      {items.map((item) => (
        <AttachmentPreviewListItem key={item.id} item={item} />
      ))}
    </div>
  );
}
