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

import type { FC } from "react";
import React, { createContext } from "react";
import { GanttStore } from "@/plane-web/store/issue_gantt_view.store";

let ganttViewStore = new GanttStore();

export const GanttStoreContext = createContext<GanttStore>(ganttViewStore);

const initializeStore = () => {
  const newGanttViewStore = ganttViewStore ?? new GanttStore();
  if (typeof window === "undefined") return newGanttViewStore;
  if (!ganttViewStore) ganttViewStore = newGanttViewStore;
  return newGanttViewStore;
};

type GanttStoreProviderProps = {
  children: React.ReactNode;
};

export function GanttStoreProvider({ children }: GanttStoreProviderProps) {
  const store = initializeStore();
  return <GanttStoreContext.Provider value={store}>{children}</GanttStoreContext.Provider>;
}
