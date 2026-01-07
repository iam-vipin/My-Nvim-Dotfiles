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

import React, { useCallback, useMemo } from "react";
import { observer } from "mobx-react";
import { useParams } from "next/navigation";
import useLocalStorage from "@/hooks/use-local-storage";
import { AppRailVisibilityContext } from "./context";
import type { IAppRailVisibilityContext } from "./types";

interface AppRailVisibilityProviderProps {
  children: React.ReactNode;
  isEnabled?: boolean; // Allow override, default false
}

/**
 * AppRailVisibilityProvider - manages app rail visibility state
 * Base provider that accepts isEnabled as a prop
 */
export const AppRailVisibilityProvider = observer(function AppRailVisibilityProvider({
  children,
  isEnabled = false,
}: AppRailVisibilityProviderProps) {
  const { workspaceSlug } = useParams();

  // User preference from localStorage
  const { storedValue: isCollapsed, setValue: setIsCollapsed } = useLocalStorage<boolean>(
    `APP_RAIL_${workspaceSlug}`,
    false // Default: not collapsed (app rail visible)
  );

  const toggleAppRail = useCallback(() => {
    setIsCollapsed(!isCollapsed);
  }, [isCollapsed, setIsCollapsed]);

  // Compute final visibility: enabled and not collapsed
  const shouldRenderAppRail = isEnabled && !isCollapsed;

  const value: IAppRailVisibilityContext = useMemo(
    () => ({
      isEnabled,
      isCollapsed: isCollapsed ?? false,
      shouldRenderAppRail,
      toggleAppRail,
    }),
    [isEnabled, isCollapsed, shouldRenderAppRail, toggleAppRail]
  );

  return <AppRailVisibilityContext.Provider value={value}>{children}</AppRailVisibilityContext.Provider>;
});
