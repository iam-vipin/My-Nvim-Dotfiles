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

import { observer } from "mobx-react";
import { GitBranch } from "lucide-react";
// plane imports
import { useTranslation } from "@plane/i18n";
import { copyTextToClipboard } from "@plane/utils";
import type { IUser } from "@plane/types";
import { TOAST_TYPE, setToast } from "@plane/propel/toast";
import { Tooltip } from "@plane/propel/tooltip";
import { IconButton } from "@plane/propel/icon-button";
// hooks
import { usePlatformOS } from "@/hooks/use-platform-os";

export type CopyBranchNameButtonProps = {
  user: IUser;
  projectIdentifier: string;
  sequenceId: number;
};

function CopyBranchNameButtonComponent(props: CopyBranchNameButtonProps) {
  const { user, projectIdentifier, sequenceId } = props;
  const { t } = useTranslation();
  const { isMobile } = usePlatformOS();

  const handleCopyBranchName = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();
    try {
      const userName = (user?.display_name || user?.first_name || "username").replace(/\s+/g, "-");
      const branchName = `${userName}/${projectIdentifier}-${sequenceId}`;
      await copyTextToClipboard(branchName);
      setToast({
        type: TOAST_TYPE.SUCCESS,
        title: t("common.branch_name_copied_to_clipboard"),
        message: branchName,
      });
    } catch (_error) {
      setToast({
        title: t("toast.error"),
        type: TOAST_TYPE.ERROR,
      });
    }
  };

  return (
    <Tooltip tooltipContent={t("common.actions.copy_branch_name")} isMobile={isMobile}>
      <IconButton variant="secondary" size="lg" onClick={handleCopyBranchName} icon={GitBranch} />
    </Tooltip>
  );
}

export const CopyBranchNameButton = observer(CopyBranchNameButtonComponent);
