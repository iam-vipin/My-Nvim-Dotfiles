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

import { FloatingOverlay, FloatingPortal } from "@floating-ui/react";
import type { UseInteractionsReturn, UseFloatingReturn } from "@floating-ui/react";

type Props = {
  children: React.ReactNode;
  classNames?: {
    buttonContainer?: string;
    button?: string;
  };
  getFloatingProps: UseInteractionsReturn["getFloatingProps"];
  getReferenceProps: UseInteractionsReturn["getReferenceProps"];
  menuButton: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  options: UseFloatingReturn;
};

export function FloatingMenuRoot(props: Props) {
  const { children, classNames, getFloatingProps, getReferenceProps, menuButton, onClick, options } = props;
  // derived values
  const { refs, floatingStyles, context } = options;

  return (
    <>
      <div className={classNames?.buttonContainer}>
        <button
          ref={refs.setReference}
          {...getReferenceProps()}
          type="button"
          className={classNames?.button}
          onClick={(e) => {
            context.onOpenChange(!context.open);
            onClick?.(e);
          }}
        >
          {menuButton}
        </button>
      </div>
      {context.open && (
        <FloatingPortal>
          {/* Backdrop */}
          <FloatingOverlay
            style={{
              zIndex: 99,
            }}
            lockScroll
          />
          <div
            ref={refs.setFloating}
            {...getFloatingProps()}
            style={{
              ...floatingStyles,
              zIndex: 100,
            }}
          >
            {children}
          </div>
        </FloatingPortal>
      )}
    </>
  );
}
