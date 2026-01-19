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

import type { ReactNode } from "react";
import { createContext } from "react";

type TImporterCreateContext = {
  // default props
  workspaceSlug: string;
  workspaceId: string;
  userId: string;
  userEmail: string;
  serviceToken: string;
  apiBaseUrl: string;
  siloBaseUrl: string;
};

export const ImporterBaseContext = createContext<TImporterCreateContext>({} as TImporterCreateContext);

type TImporterBaseContextProvider = {
  workspaceSlug: string;
  workspaceId: string;
  userId: string;
  userEmail: string;
  serviceToken: string;
  apiBaseUrl: string;
  siloBaseUrl: string;
  children: ReactNode;
};

export function ImporterBaseContextProvider(props: TImporterBaseContextProvider) {
  const { workspaceSlug, workspaceId, userId, userEmail, serviceToken, apiBaseUrl, siloBaseUrl, children } = props;

  return (
    <ImporterBaseContext.Provider
      value={{
        workspaceSlug,
        workspaceId,
        userId,
        userEmail,
        serviceToken,
        apiBaseUrl,
        siloBaseUrl,
      }}
    >
      {children}
    </ImporterBaseContext.Provider>
  );
}

export default ImporterBaseContextProvider;
