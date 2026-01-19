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
  autoUpdate,
  flip,
  hide,
  shift,
  useDismiss,
  useFloating,
  useInteractions,
  FloatingPortal,
} from "@floating-ui/react";
// components
import { UpgradeNowModal } from "@/plane-editor/components/modal/upgrade-modal";
import type { ExternalEmbedNodeViewProps } from "@/types";
import { ExternalEmbedInputView } from "./input-view";

type ExternalEmbedInputModalProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  referenceElement: HTMLElement | null;
  externalEmbedProps: ExternalEmbedNodeViewProps;
  isFlagged: boolean;
};

export function ExternalEmbedInputModal({
  isOpen,
  setIsOpen,
  referenceElement,
  externalEmbedProps,
  isFlagged,
}: ExternalEmbedInputModalProps) {
  // hooks
  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    elements: {
      reference: referenceElement,
    },
    middleware: [
      flip({
        fallbackPlacements: ["top", "bottom"],
      }),
      shift({
        padding: 5,
      }),
      hide(),
    ],
    whileElementsMounted: autoUpdate,
    placement: "bottom-start",
  });

  // handlers
  const dismiss = useDismiss(context);
  const { getFloatingProps } = useInteractions([dismiss]);

  if (!isOpen || !referenceElement) return null;
  return (
    <FloatingPortal>
      <div
        ref={refs.setFloating}
        className="mt-1.5"
        style={{
          ...floatingStyles,
          zIndex: 99,
        }}
        {...getFloatingProps()}
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        {isFlagged ? (
          <UpgradeNowModal />
        ) : (
          <ExternalEmbedInputView
            style={floatingStyles}
            setIsOpen={setIsOpen}
            externalEmbedProps={externalEmbedProps}
          />
        )}
      </div>
    </FloatingPortal>
  );
}
