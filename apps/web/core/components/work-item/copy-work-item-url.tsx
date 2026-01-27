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
// plane imports
import { useTranslation } from "@plane/i18n";
import { Tooltip } from "@plane/propel/tooltip";
import { IconButton } from "@plane/propel/icon-button";
import { CopyLinkIcon } from "@plane/propel/icons";
import { copyTextToClipboard, generateWorkItemLink } from "@plane/utils";
import { TOAST_TYPE, setToast } from "@plane/propel/toast";
// hooks
import { usePlatformOS } from "@/hooks/use-platform-os";

export type CopyWorkItemURLButtonProps = {
  workspaceSlug: string;
  projectIdentifier: string;
  sequenceId: number;
};

function CopyWorkItemURLButtonComponent(props: CopyWorkItemURLButtonProps) {
  const { workspaceSlug, projectIdentifier, sequenceId } = props;

  const { t } = useTranslation();
  const { isMobile } = usePlatformOS();
  const workItemLink = generateWorkItemLink({
    workspaceSlug: workspaceSlug,
    projectId: null,
    issueId: null,
    projectIdentifier,
    sequenceId,
  });

  const handleCopyText = async () => {
    try {
      const originURL = typeof window !== "undefined" && window.location.origin ? window.location.origin : "";
      await copyTextToClipboard(`${originURL}${workItemLink}`);
      setToast({
        type: TOAST_TYPE.SUCCESS,
        title: t("common.link_copied"),
        message: t("common.copied_to_clipboard"),
      });
    } catch (_error) {
      setToast({
        title: t("toast.error"),
        type: TOAST_TYPE.ERROR,
      });
    }
  };

  return (
    <Tooltip tooltipContent={t("common.actions.copy_link")} isMobile={isMobile}>
      <IconButton variant="secondary" size="lg" onClick={handleCopyText} icon={CopyLinkIcon} />
    </Tooltip>
  );
}

export const CopyWorkItemURLButton = observer(CopyWorkItemURLButtonComponent);
