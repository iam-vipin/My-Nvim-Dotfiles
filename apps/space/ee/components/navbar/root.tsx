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

import type { FC } from "react";
import { observer } from "mobx-react";
// ui
import { Logo } from "@plane/propel/emoji-icon-picker";
import { PhotoFilterIcon } from "@plane/propel/icons";
// hooks
import { useView } from "@/plane-web/hooks/store/use-published-view";
// store
import type { PublishStore } from "@/store/publish/publish.store";
import { ViewNavbarControls } from ".";

type Props = {
  publishSettings: PublishStore;
};

export const ViewNavbarRoot = observer(function ViewNavbarRoot(props: Props) {
  const { publishSettings } = props;

  const { viewData } = useView();

  return (
    <div className="relative flex justify-between w-full gap-4 px-5">
      {/* project detail */}
      <div className="flex flex-shrink-0 items-center gap-2">
        {viewData?.logo_props ? (
          <span className="h-7 w-7 flex-shrink-0 grid place-items-center">
            <Logo logo={viewData?.logo_props} size={16} type="lucide" />
          </span>
        ) : (
          <span className="grid h-7 w-7 flex-shrink-0 place-items-center rounded-sm uppercase">
            <PhotoFilterIcon className="h-4 w-4" />
          </span>
        )}
        <div className="line-clamp-1 max-w-[300px] overflow-hidden text-16 font-medium">{viewData?.name || `...`}</div>
      </div>

      <div className="flex flex-shrink-0 items-center gap-2">
        <ViewNavbarControls publishSettings={publishSettings} />
      </div>
    </div>
  );
});
