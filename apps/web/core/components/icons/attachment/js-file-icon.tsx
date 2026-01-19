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
// image
import JsFileIcon from "@/app/assets/attachment/js-icon.png?url";
// type
import type { ImageIconPros } from "../types";

export function JavaScriptIcon({ width, height }: ImageIconPros) {
  return <img src={JsFileIcon} width={width} height={height} alt="JsFileIcon" />;
}
