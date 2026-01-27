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

import { FileKey2 } from "lucide-react";

export function CustomAttachmentFlaggedState() {
  return (
    <a
      href="https://plane.so/pro"
      className="py-3 px-2 rounded-lg bg-layer-1 hover:bg-layer-1-hover border border-subtle flex items-start gap-2 transition-colors"
      contentEditable={false}
      target="_blank"
      rel="noopener noreferrer"
    >
      <span className="flex-shrink-0 mt-0.5 size-4 grid place-items-center">
        <FileKey2 className="size-4" />
      </span>
      <p className="not-prose text-13">
        {/* {t("attachmentComponent.upgrade.description")} */}
        Upgrade your plan to view this attachment.
      </p>
    </a>
  );
}
