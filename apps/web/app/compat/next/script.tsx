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

import { useEffect } from "react";

type ScriptProps = {
  src?: string;
  id?: string;
  strategy?: "beforeInteractive" | "afterInteractive" | "lazyOnload" | "worker";
  onLoad?: () => void;
  onError?: () => void;
  children?: string;
  defer?: boolean;
  [key: string]: any;
};

// Minimal shim for next/script that creates a script tag
function Script({ src, id, strategy: _strategy, onLoad, onError, children, ...rest }: ScriptProps) {
  useEffect(() => {
    if (src) {
      const script = document.createElement("script");
      if (id) script.id = id;
      script.src = src;
      if (onLoad) script.onload = onLoad;
      if (onError) script.onerror = onError;
      Object.keys(rest).forEach((key) => {
        script.setAttribute(key, rest[key]);
      });
      document.body.appendChild(script);

      return () => {
        if (script.parentNode) {
          document.body.removeChild(script);
        }
      };
    } else if (children) {
      const script = document.createElement("script");
      if (id) script.id = id;
      script.textContent = children;
      Object.keys(rest).forEach((key) => {
        script.setAttribute(key, rest[key]);
      });
      document.body.appendChild(script);

      return () => {
        if (script.parentNode) {
          document.body.removeChild(script);
        }
      };
    }
  }, [src, id, children, onLoad, onError, rest]);

  return null;
}

export default Script;
