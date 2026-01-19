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

import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../utils";
import type { TTabNavigationItemProps } from "./tab-navigation-types";

export function TabNavigationItem({ children, isActive, className }: TTabNavigationItemProps) {
  return (
    <div
      className={cn(
        "relative flex items-center gap-2 rounded-md px-2 py-1.5 text-13 font-medium transition-colors z-10",
        isActive ? "text-primary" : "text-secondary hover:text-primary hover:bg-layer-transparent-hover",
        className
      )}
    >
      <AnimatePresence>
        {isActive && (
          <motion.div
            className="absolute inset-0 bg-layer-transparent-active rounded-md -z-10"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{
              duration: 0.3,
              ease: [0.4, 0, 0.2, 1],
            }}
          />
        )}
      </AnimatePresence>
      {children}
    </div>
  );
}

TabNavigationItem.displayName = "TabNavigationItem";
