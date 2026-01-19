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
import AudioFileIcon from "@/app/assets/attachment/audio-icon.png?url";

export type AudioIconProps = {
  width?: number;
  height?: number;
};

export function AudioIcon({ width, height }: AudioIconProps) {
  return <img src={AudioFileIcon} width={width} height={height} alt="AudioFileIcon" />;
}
