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
import { PREFERENCE_OPTIONS } from "./config";

export const PreferencesList = observer(function PreferencesList() {
  return (
    <div className="space-y-6">
      {PREFERENCE_OPTIONS.map((option) => {
        const Component = option.component;
        return <Component key={option.id} option={option} />;
      })}
    </div>
  );
});
