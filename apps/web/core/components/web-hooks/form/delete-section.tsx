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

import { Disclosure, Transition } from "@headlessui/react";
import { WORKSPACE_SETTINGS_TRACKER_ELEMENTS } from "@plane/constants";
import { Button } from "@plane/propel/button";
import { ChevronDownIcon, ChevronUpIcon } from "@plane/propel/icons";

type Props = {
  openDeleteModal: () => void;
};

export function WebhookDeleteSection(props: Props) {
  const { openDeleteModal } = props;

  return (
    <Disclosure as="div" className="border-t border-subtle">
      {({ open }) => (
        <div className="w-full">
          <Disclosure.Button as="button" type="button" className="flex w-full items-center justify-between py-4">
            <span className="text-16 tracking-tight">Danger zone</span>
            {open ? <ChevronUpIcon className="h-5 w-5" /> : <ChevronDownIcon className="h-5 w-5" />}
          </Disclosure.Button>

          <Transition
            show={open}
            enter="transition duration-100 ease-out"
            enterFrom="transform opacity-0"
            enterTo="transform opacity-100"
            leave="transition duration-75 ease-out"
            leaveFrom="transform opacity-100"
            leaveTo="transform opacity-0"
          >
            <Disclosure.Panel>
              <div className="flex flex-col gap-8">
                <span className="text-13 tracking-tight">
                  Once a webhook is deleted, it cannot be restored. Future events will no longer be delivered to this
                  webhook.
                </span>
                <div>
                  <Button
                    variant="error-fill"
                    size="lg"
                    onClick={openDeleteModal}
                    data-ph-element={WORKSPACE_SETTINGS_TRACKER_ELEMENTS.WEBHOOK_DELETE_BUTTON}
                  >
                    Delete webhook
                  </Button>
                </div>
              </div>
            </Disclosure.Panel>
          </Transition>
        </div>
      )}
    </Disclosure>
  );
}
