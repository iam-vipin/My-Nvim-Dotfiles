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

(function initTheme() {
  try {
    const doc = globalThis.document;
    const storage = globalThis.localStorage;

    if (!doc) return;

    const theme = storage?.getItem("theme") ?? "system";
    let resolvedTheme = theme;

    if (resolvedTheme === "system") {
      resolvedTheme = globalThis.matchMedia?.("(prefers-color-scheme: dark)")?.matches ? "dark" : "light";
    }

    doc.documentElement.setAttribute("data-theme", resolvedTheme);
    doc.documentElement.style.colorScheme = resolvedTheme.includes("dark") ? "dark" : "light";
  } catch (_error) {
    // no-op
  }
})();
