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
import { Command } from "cmdk";
// local imports
import { PowerKModalCommandItem } from "../ui/modal/command-item";
import { PowerKMenuEmptyState } from "./empty-state";

type Props<T> = {
  heading?: string;
  items: T[];
  onSelect: (item: T) => void;
  getIcon?: (item: T) => React.ComponentType<{ className?: string }>;
  getIconNode?: (item: T) => React.ReactNode;
  getKey: (item: T) => string;
  getLabel: (item: T) => React.ReactNode;
  getValue: (item: T) => string;
  isSelected?: (item: T) => boolean;
  emptyText?: string;
};

export function PowerKMenuBuilder<T>({
  heading,
  items,
  onSelect,
  getIcon,
  getIconNode,
  getKey,
  getLabel,
  getValue,
  isSelected,
  emptyText,
}: Props<T>) {
  if (items.length === 0) return <PowerKMenuEmptyState emptyText={emptyText} />;

  return (
    <Command.Group heading={heading}>
      {items.map((item) => (
        <PowerKModalCommandItem
          key={getKey(item)}
          icon={getIcon?.(item)}
          iconNode={getIconNode?.(item)}
          value={getValue(item)}
          label={getLabel(item)}
          isSelected={isSelected?.(item)}
          onSelect={() => onSelect(item)}
        />
      ))}
    </Command.Group>
  );
}
