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
import type { TFilterValue, TFilterProperty } from "@plane/types";
// local imports
import type { TFilterValueInputProps } from "@/components/rich-filters/shared";

export const AdditionalFilterValueInput = observer(function AdditionalFilterValueInput<
  P extends TFilterProperty,
  V extends TFilterValue,
>(_props: TFilterValueInputProps<P, V>) {
  return (
    // Fallback
    <div className="h-full flex items-center px-4 text-11 text-placeholder transition-opacity duration-200 cursor-not-allowed">
      Filter type not supported
    </div>
  );
});
