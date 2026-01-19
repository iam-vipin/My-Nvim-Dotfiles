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

import { observer } from "mobx-react";
import React, { createContext } from "react";
// store
import { TranslationStore } from "../store";

export const TranslationContext = createContext<TranslationStore | null>(null);

interface TranslationProviderProps {
  children: React.ReactNode;
}

/**
 * Provides the translation store to the application
 */
export const TranslationProvider = observer(function TranslationProvider({ children }: TranslationProviderProps) {
  const [store] = React.useState(() => new TranslationStore());

  return <TranslationContext.Provider value={store}>{children}</TranslationContext.Provider>;
});
