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

type TUseDropdownKeyDown = {
  (
    onOpen: () => void,
    onClose: () => void,
    isOpen: boolean,
    selectActiveItem?: () => void
  ): (event: React.KeyboardEvent<HTMLElement>) => void;
};

export const useDropdownKeyDown: TUseDropdownKeyDown = (onOpen, onClose, isOpen, selectActiveItem?) => {
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLElement>) => {
      if (event.key === "Enter" && !event.nativeEvent.isComposing) {
        if (!isOpen) {
          event.stopPropagation();
          onOpen();
        } else {
          selectActiveItem && selectActiveItem();
        }
      } else if (event.key === "Escape" && isOpen) {
        event.stopPropagation();
        onClose();
      }
    },
    [isOpen, onOpen, onClose]
  );

  return handleKeyDown;
};
