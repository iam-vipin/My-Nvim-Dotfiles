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

import { getAttributes } from "@tiptap/core";
import type { MarkType } from "@tiptap/pm/model";
import { Plugin, PluginKey } from "@tiptap/pm/state";

type ClickHandlerOptions = {
  type: MarkType;
};

export function clickHandler(options: ClickHandlerOptions): Plugin {
  return new Plugin({
    key: new PluginKey("handleClickLink"),
    props: {
      handleClick: (view, pos, event) => {
        if (event.button !== 0) {
          return false;
        }

        let a = event.target as HTMLElement;
        const els: HTMLElement[] = [];

        while (a?.nodeName !== "DIV") {
          els.push(a);
          a = a?.parentNode as HTMLElement;
        }

        if (!els.find((value) => value.nodeName === "A")) {
          return false;
        }

        const attrs = getAttributes(view.state, options.type.name);
        const link = event.target as HTMLLinkElement;

        const href = link?.href ?? attrs.href;
        const target = link?.target ?? attrs.target;

        if (link && href) {
          window.open(href, target);

          return true;
        }

        return false;
      },
    },
  });
}
