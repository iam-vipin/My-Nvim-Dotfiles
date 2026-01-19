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
// plane web components
import { PageCommentControl } from "@/plane-web/components/pages/header/comment-control";
import { PageLockControl } from "@/plane-web/components/pages/header/lock-control";
import { PageMoveControl } from "@/plane-web/components/pages/header/move-control";
import { PageShareControl } from "@/plane-web/components/pages/header/share-control";
// plane web hooks
import { EPageStoreType } from "@/plane-web/hooks/store";
// store
import type { TPageInstance } from "@/store/pages/base-page";
// local imports
import { PageOptionsDropdown } from "../editor/toolbar";
import { PageArchivedBadge } from "./archived-badge";
import { PageCopyLinkControl } from "./copy-link-control";
import { PageFavoriteControl } from "./favorite-control";
import { PageOfflineBadge } from "./offline-badge";

type Props = {
  page: TPageInstance;
  storeType: EPageStoreType;
};

export const PageHeaderActions = observer(function PageHeaderActions(props: Props) {
  const { page, storeType } = props;
  // store hooks
  const { isContentEditable } = page;

  return (
    <div className="flex items-center gap-1">
      <PageArchivedBadge page={page} />
      <PageOfflineBadge page={page} />
      {isContentEditable && (
        <>
          <PageLockControl page={page} storeType={storeType} />
          <PageMoveControl page={page} />
        </>
      )}
      <PageCopyLinkControl page={page} />
      <PageFavoriteControl page={page} />
      {isContentEditable && (
        <>
          <PageCommentControl page={page} storeType={storeType} />
          <PageShareControl page={page} storeType={storeType} />
        </>
      )}
      <PageOptionsDropdown page={page} storeType={storeType} />
    </div>
  );
});
