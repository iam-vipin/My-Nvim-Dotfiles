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
import { Disclosure, Transition } from "@headlessui/react";
import { ChevronRightIcon } from "@plane/propel/icons";
// plane imports
import { cn } from "@plane/utils";

type TProps = {
  actionButtons?: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  headerActions?: React.ReactNode | ((open: boolean) => React.ReactNode);
  title: string;
};

export function AutomationDetailsSidebarSectionWrapper(props: TProps) {
  const { actionButtons, children, defaultOpen = true, headerActions, title } = props;

  return (
    <Disclosure as="section" defaultOpen={defaultOpen} className="flex-grow w-full">
      {({ open }) => (
        <>
          <div className="px-3">
            <Disclosure.Button
              className={cn(
                "group/section-wrapper flex items-center gap-2 py-1.5 px-1 flex-shrink-0 w-full hover:rounded-sm hover:text-primary hover:bg-layer-transparent-hover"
              )}
              aria-label="Toggle section"
            >
              <h3 className="flex-shrink-0 text-9 font-semibold uppercase text-tertiary">{title}</h3>
              <div className="flex-grow h-px" />
              {typeof headerActions === "function" ? headerActions(open) : headerActions}
              <div className="flex-shrink-0 size-4 rounded-sm grid place-items-center outline-none border-none">
                <ChevronRightIcon className={cn("size-3.5 transition-transform", { "rotate-90": open })} />
              </div>
            </Disclosure.Button>
          </div>
          <Transition
            enter="transition duration-100 ease-out"
            enterFrom="transform scale-95 opacity-0"
            enterTo="transform scale-100 opacity-100"
            leave="transition duration-75 ease-out"
            leaveFrom="transform scale-100 opacity-100"
            leaveTo="transform scale-95 opacity-0"
          >
            <Disclosure.Panel className="mt-2 space-y-3">
              <div className="space-y-3 px-4">{children}</div>
              {actionButtons}
            </Disclosure.Panel>
          </Transition>
        </>
      )}
    </Disclosure>
  );
}
