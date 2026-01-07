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

import { CheckIcon } from "@plane/propel/icons";
import { Combobox } from "@headlessui/react";
// plane imports
import { cn } from "@plane/utils";

export type TMovePageModalListItem = {
  logo: React.ReactNode;
  name: string;
  value: string;
};

type Props = {
  item: TMovePageModalListItem;
};

export function MovePageModalListItem(props: Props) {
  const { item } = props;

  return (
    <Combobox.Option
      key={item.value}
      value={item.value}
      className={({ active, selected }) =>
        cn(
          "flex items-center justify-between gap-2 truncate w-full cursor-pointer select-none rounded-md p-1 text-secondary transition-colors",
          {
            "bg-layer-1": active && !selected,
            "text-primary bg-accent-primary/20": selected,
            "bg-accent-primary/30": selected && active,
          }
        )
      }
    >
      {({ selected }) => (
        <>
          <div className="flex items-center gap-2 truncate">
            <span
              className={cn("shrink-0 size-6 grid place-items-center rounded", {
                "bg-layer-1": !selected,
              })}
            >
              {item.logo}
            </span>
            <p className="text-13 truncate">{item.name}</p>
          </div>
          {selected && <CheckIcon className="shrink-0 size-4 text-primary" />}
        </>
      )}
    </Combobox.Option>
  );
}
