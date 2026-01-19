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
import React, { useState } from "react";
import { observer } from "mobx-react";
import { Collapsible } from "@plane/ui";
import { RequestAttachmentsCollapsibleContent } from "@/plane-web/components/customers";
import { RequestAttachmentCollapsibleTitle } from "./collapsible-title";

type TProps = {
  workspaceSlug: string;
  requestId: string;
  customerId: string;
  isEditable?: boolean;
};

export const RequestAttachmentsCollapsible = observer(function RequestAttachmentsCollapsible(props: TProps) {
  const { workspaceSlug, requestId, customerId, isEditable } = props;
  // states
  const [isOpen, setOpen] = useState<boolean>(false);

  return (
    <Collapsible
      title={
        <RequestAttachmentCollapsibleTitle
          workspaceSlug={workspaceSlug}
          requestId={requestId}
          customerId={customerId}
          isOpen={isOpen}
          disabled={!isEditable}
        />
      }
      buttonClassName="flex justify-between items-center w-full"
      isOpen={isOpen}
      onToggle={() => setOpen(!isOpen)}
    >
      <RequestAttachmentsCollapsibleContent
        workspaceSlug={workspaceSlug}
        requestId={requestId}
        customerId={customerId}
        disabled={!isEditable}
      />
    </Collapsible>
  );
});
