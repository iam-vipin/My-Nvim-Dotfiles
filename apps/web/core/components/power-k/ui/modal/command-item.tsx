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

import { CheckIcon } from "@plane/propel/icons";
// plane imports
import { cn } from "@plane/utils";
// local imports
import { KeySequenceBadge, ShortcutBadge } from "./command-item-shortcut-badge";

type Props = {
  icon?: React.ComponentType<{ className?: string }>;
  iconNode?: React.ReactNode;
  isDisabled?: boolean;
  isSelected?: boolean;
  keySequence?: string;
  label: string | React.ReactNode;
  onSelect: () => void;
  shortcut?: string;
  value?: string;
  forceMount?: boolean;
};

export function PowerKModalCommandItem(props: Props) {
  const {
    icon: Icon,
    iconNode,
    isDisabled,
    isSelected,
    keySequence,
    label,
    onSelect,
    shortcut,
    value,
    forceMount,
  } = props;

  return (
    <Command.Item
      value={value}
      onSelect={onSelect}
      className="focus:outline-none"
      disabled={isDisabled}
      forceMount={forceMount}
    >
      <div
        className={cn("flex items-center gap-2 text-secondary", {
          "opacity-70": isDisabled,
        })}
      >
        {Icon && <Icon className="shrink-0 size-3.5" />}
        {iconNode}
        {label}
      </div>
      <div className="shrink-0 flex items-center gap-2">
        {isSelected && <CheckIcon className="shrink-0 size-3 text-secondary" />}
        {keySequence && <KeySequenceBadge sequence={keySequence} />}
        {shortcut && <ShortcutBadge shortcut={shortcut} />}
      </div>
    </Command.Item>
  );
}
