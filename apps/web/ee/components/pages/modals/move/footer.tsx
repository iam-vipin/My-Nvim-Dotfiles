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

// plane imports
import { useTranslation } from "@plane/i18n";
import { Button } from "@plane/propel/button";

type Props = {
  disabled: boolean;
  isMoving: boolean;
  onClose: () => void;
  onMove: () => void;
};

export function MovePageModalFooter(props: Props) {
  const { onClose, onMove, isMoving, disabled } = props;
  // translation
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-end gap-2 p-3">
      <Button variant="secondary" onClick={onClose}>
        {t("common.cancel")}
      </Button>
      <Button variant="primary" onClick={onMove} loading={isMoving} disabled={disabled}>
        {isMoving
          ? t("page_actions.move_page.submit_button.loading")
          : t("page_actions.move_page.submit_button.default")}
      </Button>
    </div>
  );
}
