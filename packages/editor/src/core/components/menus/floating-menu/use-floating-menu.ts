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

import {
  shift,
  flip,
  useDismiss,
  useFloating,
  useInteractions,
  autoUpdate,
  useClick,
  useRole,
} from "@floating-ui/react";
import type { UseInteractionsReturn, UseFloatingReturn } from "@floating-ui/react";
import { useState } from "react";

type TArgs = {
  handleOpenChange?: (open: boolean) => void;
};

type TReturn = {
  options: UseFloatingReturn;
  getReferenceProps: UseInteractionsReturn["getReferenceProps"];
  getFloatingProps: UseInteractionsReturn["getFloatingProps"];
};

export const useFloatingMenu = (args: TArgs): TReturn => {
  const { handleOpenChange } = args;
  // states
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  // floating ui
  const options = useFloating({
    placement: "bottom-start",
    middleware: [
      flip({
        fallbackPlacements: ["top-start", "bottom-start", "top-end", "bottom-end"],
      }),
      shift({
        padding: 8,
      }),
    ],
    open: isDropdownOpen,
    onOpenChange: (open) => {
      setIsDropdownOpen(open);
      handleOpenChange?.(open);
    },
    whileElementsMounted: autoUpdate,
  });
  const { context } = options;
  const click = useClick(context);
  const dismiss = useDismiss(context);
  const role = useRole(context);
  const { getReferenceProps, getFloatingProps } = useInteractions([dismiss, click, role]);

  return {
    options,
    getReferenceProps,
    getFloatingProps,
  };
};
