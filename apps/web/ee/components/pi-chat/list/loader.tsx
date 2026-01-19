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

import { Loader } from "@plane/ui";
import { cn } from "@plane/utils";

function PiChatListLoader() {
  return Array.from({ length: 3 }).map((_, index) => (
    <Loader
      key={index}
      className={cn(
        "w-full overflow-hidden py-4 flex-1 flex flex-col items-start gap-1 text-secondary truncate hover:text-secondary hover:bg-layer-1 pointer"
      )}
    >
      <Loader.Item width="200px" height="21px" />
      <Loader.Item width="100px" height="18px" />
    </Loader>
  ));
}

export default PiChatListLoader;
