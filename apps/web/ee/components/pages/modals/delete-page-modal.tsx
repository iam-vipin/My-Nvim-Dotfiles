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

import { useState } from "react";
import { observer } from "mobx-react";
import { useRouter } from "next/navigation";
// plane imports
import { TOAST_TYPE, setToast } from "@plane/propel/toast";
import { AlertModalCore } from "@plane/ui";
// helpers
import { getPageName } from "@plane/utils";
// plane web hooks
import { EPageStoreType, usePageStore } from "@/plane-web/hooks/store";
import type { TPageInstance } from "@/store/pages/base-page";

type TConfirmPageDeletionProps = {
  isOpen: boolean;
  onClose: () => void;
  page: TPageInstance;
};

export const WikiDeletePageModal = observer(function WikiDeletePageModal(props: TConfirmPageDeletionProps) {
  const { isOpen, onClose, page } = props;
  // states
  const [isDeleting, setIsDeleting] = useState(false);
  // store hooks
  const { removePage } = usePageStore(EPageStoreType.WORKSPACE);

  const router = useRouter();
  if (!page) return null;

  const { name } = page;

  const handleClose = () => {
    setIsDeleting(false);
    onClose();
  };

  const handleDelete = async () => {
    if (!page.id) return;
    setIsDeleting(true);
    await removePage({ pageId: page.id, shouldSync: true })
      .then(() => {
        handleClose();
        setToast({
          type: TOAST_TYPE.SUCCESS,
          title: "Success!",
          message: "Page deleted successfully.",
        });
        router.back();
      })
      .catch(() => {
        setToast({
          type: TOAST_TYPE.ERROR,
          title: "Error!",
          message: "Page could not be deleted. Please try again.",
        });
      });

    setIsDeleting(false);
  };

  return (
    <AlertModalCore
      handleClose={handleClose}
      handleSubmit={handleDelete}
      isSubmitting={isDeleting}
      isOpen={isOpen}
      title="Delete page"
      content={
        <>
          Are you sure you want to delete page -{" "}
          <span className="break-words font-medium text-primary">{getPageName(name)}</span> ? The Page will be deleted
          permanently. This action cannot be undone.
        </>
      }
    />
  );
});
