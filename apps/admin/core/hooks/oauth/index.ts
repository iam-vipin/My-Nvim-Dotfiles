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

import type { TInstanceAuthenticationModes } from "@plane/types";
import { getCoreAuthenticationModesMap } from "./core";
import { getExtendedAuthenticationModesMap } from "./extended";
import type { TGetAuthenticationModeProps } from "./types";

export const useAuthenticationModes = (props: TGetAuthenticationModeProps): TInstanceAuthenticationModes[] => {
  // derived values
  const authenticationModes = getCoreAuthenticationModesMap(props);
  const authenticationModesExtended = getExtendedAuthenticationModesMap(props);

  const availableAuthenticationModes: TInstanceAuthenticationModes[] = [
    authenticationModes["unique-codes"],
    authenticationModes["passwords-login"],
    authenticationModes["google"],
    authenticationModes["github"],
    authenticationModes["gitlab"],
    authenticationModes["gitea"],
    authenticationModesExtended["oidc"],
    authenticationModesExtended["saml"],
    authenticationModesExtended["ldap"],
  ];

  return availableAuthenticationModes;
};
