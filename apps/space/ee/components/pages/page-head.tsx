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
import { Logo } from "@plane/propel/emoji-icon-picker";
import { PageIcon } from "@plane/propel/icons";
import type { IPage } from "@/plane-web/store/pages";

type Props = {
  pageDetails: IPage;
};
export const PageHeader = observer(function PageHeader({ pageDetails }: Props) {
  return (
    <div className="w-full py-3 page-header-container">
      <div className="space-y-2 block bg-transparent w-full max-w-[720px] mx-auto transition-all duration-200 ease-in-out">
        <div className="size-[60px] bg-layer-3 rounded grid place-items-center">
          {pageDetails.logo_props?.in_use ? (
            <Logo logo={pageDetails.logo_props} size={36} type="lucide" />
          ) : (
            <PageIcon className="size-9 text-tertiary" />
          )}
        </div>
        <h1 className="text-h1-bold break-words">{pageDetails.name}</h1>
      </div>
    </div>
  );
});
