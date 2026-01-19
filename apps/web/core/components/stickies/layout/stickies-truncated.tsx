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
import Link from "next/link";
import { useParams } from "next/navigation";
import useSWR from "swr";
// plane utils
import { useTranslation } from "@plane/i18n";
import { cn } from "@plane/utils";
// hooks
import { useSticky } from "@/hooks/use-stickies";
// components
import { ContentOverflowWrapper } from "../../core/content-overflow-HOC";
import { StickiesLayout } from "./stickies-list";

type StickiesTruncatedProps = {
  handleClose?: () => void;
};

export const StickiesTruncated = observer(function StickiesTruncated(props: StickiesTruncatedProps) {
  const { handleClose = () => {} } = props;
  // navigation
  const { workspaceSlug } = useParams();
  // store hooks
  const { fetchWorkspaceStickies } = useSticky();
  const { t } = useTranslation();

  useSWR(
    workspaceSlug ? `WORKSPACE_STICKIES_${workspaceSlug}` : null,
    workspaceSlug ? () => fetchWorkspaceStickies(workspaceSlug.toString()) : null,
    { revalidateIfStale: false, revalidateOnFocus: false }
  );

  return (
    <ContentOverflowWrapper
      maxHeight={620}
      containerClassName="pb-2 box-border"
      fallback={null}
      customButton={
        <Link
          href={`/${workspaceSlug}/stickies`}
          className={cn(
            "gap-1 w-full text-accent-primary text-13 font-medium transition-opacity duration-300 bg-surface-2/20"
          )}
          onClick={handleClose}
        >
          {t("show_all")}
        </Link>
      }
    >
      <StickiesLayout workspaceSlug={workspaceSlug?.toString()} />
    </ContentOverflowWrapper>
  );
});
