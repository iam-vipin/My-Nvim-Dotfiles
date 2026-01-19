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
// ui
import { useTranslation } from "@plane/i18n";
import { TOAST_TYPE, setToast } from "@plane/propel/toast";
import { AlertModalCore } from "@plane/ui";

interface IStickyDelete {
  isOpen: boolean;
  handleSubmit: () => Promise<void>;
  handleClose: () => void;
}

export const StickyDeleteModal = observer(function StickyDeleteModal(props: IStickyDelete) {
  const { isOpen, handleClose, handleSubmit } = props;
  // states
  const [loader, setLoader] = useState(false);
  // hooks
  const { t } = useTranslation();

  const formSubmit = async () => {
    try {
      setLoader(true);
      await handleSubmit();
    } catch {
      setToast({
        type: TOAST_TYPE.ERROR,
        title: t("stickies.toasts.not_removed.title"),
        message: t("stickies.toasts.not_removed.message"),
      });
    } finally {
      setLoader(false);
    }
  };

  return (
    <AlertModalCore
      handleClose={handleClose}
      handleSubmit={formSubmit}
      isSubmitting={loader}
      isOpen={isOpen}
      title={t("stickies.delete")}
      content={t("stickies.delete_confirmation")}
    />
  );
});
