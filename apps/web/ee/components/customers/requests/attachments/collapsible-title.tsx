import type { FC } from "react";
import React from "react";
import { observer } from "mobx-react";
import { Plus } from "lucide-react";
import { useTranslation } from "@plane/i18n";
// plane ui
import { DropdownIcon } from "@plane/propel/icons";
// plane web hooks
import { cn } from "@plane/utils";
import { useCustomers } from "@/plane-web/hooks/store";
// helpers
import { AddAttachmentButton } from "./add-attachment-btn";

type Props = {
  workspaceSlug: string;
  requestId: string;
  customerId: string;
  isOpen: boolean;
  disabled?: boolean;
};

export const RequestAttachmentCollapsibleTitle = observer(function RequestAttachmentCollapsibleTitle(props: Props) {
  const { workspaceSlug, requestId, isOpen, customerId, disabled = true } = props;
  // store hooks
  const { getRequestById } = useCustomers();

  // derived values
  const request = getRequestById(requestId);
  const requestAttachmentsCount = request?.attachment_count || 0;

  const { t } = useTranslation();

  return (
    <>
      <div className="flex items-center gap-2">
        <DropdownIcon
          className={cn("size-2 text-secondary hover:text-secondary duration-300", {
            "-rotate-90": !isOpen,
          })}
        />
        <div className="text-12 text-tertiary font-medium">
          {t("common.attachments")} <span className="text-placeholder text-12">{requestAttachmentsCount}</span>
        </div>
      </div>
      {!disabled && (
        <AddAttachmentButton
          requestId={requestId}
          workspaceSlug={workspaceSlug}
          customerId={customerId}
          disabled={disabled}
        >
          <Plus className="h-4 w-4" />
        </AddAttachmentButton>
      )}
    </>
  );
});
