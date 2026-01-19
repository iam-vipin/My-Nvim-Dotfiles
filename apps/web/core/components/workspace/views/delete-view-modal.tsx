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
import { useParams } from "next/navigation";
// Plane Imports
import { useTranslation } from "@plane/i18n";
import { TOAST_TYPE, setToast } from "@plane/propel/toast";
import type { IWorkspaceView } from "@plane/types";
import { AlertModalCore } from "@plane/ui";
// hooks
import { useGlobalView } from "@/hooks/store/use-global-view";

type Props = {
  data: IWorkspaceView;
  isOpen: boolean;
  onClose: () => void;
};

export const DeleteGlobalViewModal = observer(function DeleteGlobalViewModal(props: Props) {
  const { data, isOpen, onClose } = props;
  // states
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  // router
  const { workspaceSlug } = useParams();
  // store hooks
  const { deleteGlobalView } = useGlobalView();
  const { t } = useTranslation();
  const handleClose = () => onClose();

  const handleDeletion = async () => {
    if (!workspaceSlug) return;
    setIsDeleteLoading(true);

    try {
      await deleteGlobalView(workspaceSlug.toString(), data.id);
    } catch (_error) {
      setToast({
        type: TOAST_TYPE.ERROR,
        title: "Error!",
        message: "Failed to delete the view. Please try again.",
      });
    }

    setIsDeleteLoading(false);
    handleClose();
    // remove filters from local storage
    localStorage.removeItem(`global_view_filters/${data.id}`);
  };

  return (
    <AlertModalCore
      handleClose={handleClose}
      handleSubmit={handleDeletion}
      isSubmitting={isDeleteLoading}
      isOpen={isOpen}
      title={t("workspace_views.delete_view.title")}
      content={<>{t("workspace_views.delete_view.content")}</>}
    />
  );
});
