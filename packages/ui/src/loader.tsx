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
// helpers
import { cn } from "./utils";

type Props = {
  children: React.ReactNode;
  className?: string;
};

function Loader({ children, className = "" }: Props) {
  return (
    <div className={cn("animate-pulse", className)} role="status">
      {children}
    </div>
  );
}

type ItemProps = {
  height?: string;
  width?: string;
  className?: string;
};

function Item({ height = "auto", width = "auto", className = "" }: ItemProps) {
  return <div className={cn("rounded-md bg-layer-1", className)} style={{ height: height, width: width }} />;
}

Loader.Item = Item;

Loader.displayName = "plane-ui-loader";

export { Loader };
