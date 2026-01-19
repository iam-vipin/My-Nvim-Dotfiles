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

export interface IInstanceConfigExtended {
  // instance
  is_airgapped: boolean;
  // auth
  is_oidc_enabled: boolean;
  oidc_provider_name: string | undefined;
  is_saml_enabled: boolean;
  saml_provider_name: string | undefined;
  is_ldap_enabled: boolean;
  ldap_provider_name: string | undefined;
  // feature flags
  payment_server_base_url?: string;
  prime_server_base_url?: string;
  feature_flag_server_base_url?: string;
  // silo
  silo_base_url: string | undefined;
  // elasticsearch
  is_elasticsearch_enabled: boolean;
}
