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

import { useCallback } from "react";

type TUseDropdownKeyPressed = {
  (
    onEnterKeyDown: () => void,
    onEscKeyDown: () => void,
    stopPropagation?: boolean
  ): (event: React.KeyboardEvent<HTMLElement>) => void;
};

export const useDropdownKeyPressed: TUseDropdownKeyPressed = (onEnterKeyDown, onEscKeyDown, stopPropagation = true) => {
  const stopEventPropagation = useCallback(
    (event: React.KeyboardEvent<HTMLElement>) => {
      if (stopPropagation) {
        event.stopPropagation();
        event.preventDefault();
      }
    },
    [stopPropagation]
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLElement>) => {
      if (event.key === "Enter") {
        stopEventPropagation(event);
        onEnterKeyDown();
      } else if (event.key === "Escape") {
        stopEventPropagation(event);
        onEscKeyDown();
      } else if (event.key === "Tab") onEscKeyDown();
    },
    [onEnterKeyDown, onEscKeyDown, stopEventPropagation]
  );

  return handleKeyDown;
};
