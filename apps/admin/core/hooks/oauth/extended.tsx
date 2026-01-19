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

import type { TExtendedInstanceAuthenticationModeKeys, TInstanceAuthenticationModes } from "@plane/types";
// assets
import ldapLogo from "@/app/assets/logos/ldap.webp?url";
import oidcLogo from "@/app/assets/logos/oidc-logo.svg?url";
import samlLogo from "@/app/assets/logos/saml-logo.svg?url";
// plane admin components
import { OIDCConfiguration, SAMLConfiguration, LDAPConfiguration } from "@/plane-admin/components/authentication";
// types
import type { TGetAuthenticationModeProps } from "./types";

export const getExtendedAuthenticationModesMap: (
  props: TGetAuthenticationModeProps
) => Record<TExtendedInstanceAuthenticationModeKeys, TInstanceAuthenticationModes> = ({ disabled, updateConfig }) => ({
  oidc: {
    key: "oidc",
    name: "OIDC",
    description: "Authenticate your users via the OpenID Connect protocol.",
    icon: <img src={oidcLogo} height={22} width={22} alt="OIDC Logo" />,
    config: <OIDCConfiguration disabled={disabled} updateConfig={updateConfig} />,
  },
  saml: {
    key: "saml",
    name: "SAML",
    description: "Authenticate your users via the Security Assertion Markup Language protocol.",
    icon: <img src={samlLogo} height={22} width={22} alt="SAML Logo" className="pl-0.5" />,
    config: <SAMLConfiguration disabled={disabled} updateConfig={updateConfig} />,
  },
  ldap: {
    key: "ldap",
    name: "LDAP",
    description: "Authenticate your users via LDAP directory services.",
    icon: <img src={ldapLogo} height={22} width={22} alt="LDAP Logo" />,
    config: <LDAPConfiguration disabled={disabled} updateConfig={updateConfig} />,
  },
});
