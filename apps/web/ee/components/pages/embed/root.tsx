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

import React from "react";
import { observer } from "mobx-react";
import type { TPageEmbedConfig } from "@plane/editor";
// icons
import { EmptyPageIcon } from "@plane/propel/icons";
import type { TPage } from "@plane/types";
// plane web store
import type { EPageStoreType } from "@/plane-web/hooks/store";
// embed content component
import { PageEmbedContent } from "./content";

type Props = {
  embedPageId: string;
  previewDisabled?: boolean;
  storeType: EPageStoreType;
  redirectLink?: string;
  onPageDrop?: (droppedPageId: string) => void;
  isDroppable?: boolean;
  pageDetails?: TPage;
  updateAttributes?: Parameters<TPageEmbedConfig["widgetCallback"]>[0]["updateAttributes"];
  parentPage?: TPage;
};

export const PageEmbedCardRoot = observer(function PageEmbedCardRoot(props: Props) {
  return <PageEmbedContent {...props} />;
});

export function PlaceholderEmbed() {
  return (
    <div className="not-prose relative page-embed cursor-pointer rounded-md py-2 px-2 my-1.5 flex items-center gap-1.5 !no-underline group overflow-hidden">
      <div className="relative z-10">
        <EmptyPageIcon className="size-4" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent bg-[length:200%_100%] animate-[shimmer_5s_var(--ease-out-cubic)_infinite]" />
    </div>
  );
}
