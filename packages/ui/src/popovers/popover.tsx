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

import { Popover as HeadlessReactPopover, Transition } from "@headlessui/react";
import { EllipsisVertical } from "lucide-react";
import type { Ref } from "react";
import React, { Fragment, useState } from "react";
import { usePopper } from "react-popper";
// helpers
import { cn } from "../utils";
// types
import type { TPopover } from "./types";

export function Popover(props: TPopover) {
  const {
    popperPosition = "bottom-end",
    popperPadding = 0,
    buttonClassName = "",
    popoverClassName = "",
    button,
    disabled = false,
    panelClassName = "",
    children,
    popoverButtonRef,
    buttonRefClassName = "",
  } = props;
  // states
  const [referenceElement, setReferenceElement] = useState<HTMLDivElement | null>(null);
  const [popperElement, setPopperElement] = useState<HTMLDivElement | null>(null);

  // react-popper derived values
  const { styles, attributes } = usePopper(referenceElement, popperElement, {
    placement: popperPosition,
    modifiers: [
      {
        name: "preventOverflow",
        options: {
          padding: popperPadding,
        },
      },
    ],
  });

  return (
    <HeadlessReactPopover className={cn("relative flex h-full w-full items-center justify-center", popoverClassName)}>
      <div ref={setReferenceElement} className={cn("w-full", buttonRefClassName)}>
        <HeadlessReactPopover.Button
          ref={popoverButtonRef as Ref<HTMLButtonElement>}
          className={cn(
            {
              "flex justify-center items-center text-14 h-6 w-6 rounded-sm transition-all bg-surface-2 hover:bg-layer-1":
                !button,
            },
            buttonClassName
          )}
          disabled={disabled}
        >
          {button ? button : <EllipsisVertical className="h-3 w-3" />}
        </HeadlessReactPopover.Button>
      </div>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-200"
        enterFrom="opacity-0 translate-y-1"
        enterTo="opacity-100 translate-y-0"
        leave="transition ease-in duration-150"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 translate-y-1"
      >
        <HeadlessReactPopover.Panel
          ref={setPopperElement}
          style={styles.popper}
          {...attributes.popper}
          className={cn("absolute left-0 top-full z-20 w-screen max-w-xs mt-2", panelClassName)}
        >
          {children}
        </HeadlessReactPopover.Panel>
      </Transition>
    </HeadlessReactPopover>
  );
}
