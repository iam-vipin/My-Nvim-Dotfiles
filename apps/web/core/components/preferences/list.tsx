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

import { PREFERENCE_OPTIONS } from "@plane/constants";
import { PREFERENCE_COMPONENTS } from "@/plane-web/components/preferences/config";

export function PreferencesList() {
  return (
    <div className="py-6 space-y-6">
      {PREFERENCE_OPTIONS.map((option) => {
        const Component = PREFERENCE_COMPONENTS[option.id as keyof typeof PREFERENCE_COMPONENTS];
        return <Component key={option.id} option={option} />;
      })}
    </div>
  );
}
