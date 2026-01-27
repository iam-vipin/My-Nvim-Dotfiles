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

import { Image as BaseImageExtension } from "@tiptap/extension-image";
// local imports
import type { CustomImageExtensionOptions } from "../custom-image/types";
import type { ImageExtensionStorage } from "./extension";

export const ImageExtensionConfig = BaseImageExtension.extend<
  Pick<CustomImageExtensionOptions, "getImageSource">,
  ImageExtensionStorage
>({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: "35%",
      },
      height: {
        default: null,
      },
      aspectRatio: {
        default: null,
      },
      alignment: {
        default: "left",
      },
    };
  },
});
