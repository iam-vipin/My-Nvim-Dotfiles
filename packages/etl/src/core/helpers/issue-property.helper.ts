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

import type { TTextSettings, TTextSettingsDisplayOptions } from "@plane/sdk";

export const getTextPropertySettings = (display_format: TTextSettingsDisplayOptions): TTextSettings => {
  switch (display_format) {
    case "single-line":
      return { display_format: "single-line" };
    case "multi-line":
      return { display_format: "multi-line" };
    case "readonly":
      return { display_format: "readonly" };
  }
};
