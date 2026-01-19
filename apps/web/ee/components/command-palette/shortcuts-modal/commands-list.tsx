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

import { Command } from "lucide-react";
// helpers
import { substringMatch } from "@plane/utils";
// hooks
import { usePlatformOS } from "@/hooks/use-platform-os";

type Props = {
  searchQuery: string;
};

export function PagesAppShortcutCommandsList(props: Props) {
  const { searchQuery } = props;
  const { platform } = usePlatformOS();

  const KEYBOARD_SHORTCUTS = [
    {
      key: "navigation",
      title: "Navigation",
      shortcuts: [{ keys: "Ctrl,K", description: "Open command menu" }],
    },
    {
      key: "common",
      title: "Common",
      shortcuts: [
        { keys: "D", description: "Create page" },
        { keys: "H", description: "Open shortcuts guide" },
      ],
    },
  ];

  const filteredShortcuts = KEYBOARD_SHORTCUTS.map((category) => {
    const newCategory = { ...category };

    newCategory.shortcuts = newCategory.shortcuts.filter((shortcut) =>
      substringMatch(shortcut.description, searchQuery)
    );

    return newCategory;
  });

  const isShortcutsEmpty = filteredShortcuts.every((category) => category.shortcuts.length === 0);

  return (
    <div className="flex flex-col gap-y-3 overflow-y-auto">
      {!isShortcutsEmpty ? (
        filteredShortcuts.map((category) => {
          if (category.shortcuts.length === 0) return;

          return (
            <div key={category.key}>
              <h5 className="text-left text-13 font-medium">{category.title}</h5>
              <div className="space-y-3 px-1">
                {category.shortcuts.map((shortcut) => (
                  <div key={shortcut.keys} className="mt-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-11 text-secondary text-left">{shortcut.description}</h4>
                      <div className="flex items-center gap-x-1.5">
                        {shortcut.keys.split(",").map((key) => (
                          <div key={key} className="flex items-center gap-1">
                            {key === "Ctrl" ? (
                              <div className="grid h-6 min-w-[1.5rem] place-items-center rounded-sm border-[0.5px] border-subtle-1 bg-layer-1 px-1.5 text-10 text-secondary">
                                {platform === "MacOS" ? <Command className="h-2.5 w-2.5 text-secondary" /> : "Ctrl"}
                              </div>
                            ) : (
                              <kbd className="grid h-6 min-w-[1.5rem] place-items-center rounded-sm border-[0.5px] border-subtle-1 bg-layer-1 px-1.5 text-10 text-secondary">
                                {key}
                              </kbd>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })
      ) : (
        <p className="flex justify-center text-center text-13 text-secondary">
          No shortcuts found for{" "}
          <span className="font-semibold italic">
            {`"`}
            {searchQuery}
            {`"`}
          </span>
        </p>
      )}
    </div>
  );
}
