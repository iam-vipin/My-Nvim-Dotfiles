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

export type TDomainVerificationStatus = "pending" | "verified" | "failed";

export type TDomain = {
  id: string;
  domain: string;
  verification_status: TDomainVerificationStatus;
  verification_token: string;
  verified_at: string | null;
  created_at: string;
  updated_at: string;
};

export type TCreateDomainRequest = Pick<TDomain, "domain">;

export type TProviderType = "oidc" | "saml";

// Base provider fields (common to all providers)
type TBaseIdentityProvider = {
  id: string;
  is_enabled: boolean;
  logout_url: string | null;
  created_at: string;
  updated_at: string;
};

// OIDC-specific provider type
export type TIdentityProviderOIDC = TBaseIdentityProvider & {
  provider: "oidc";
  client_id: string;
  client_secret: string;
  authorize_url: string;
  token_url: string;
  userinfo_url: string;
};

// SAML-specific provider type
export type TIdentityProviderSAML = TBaseIdentityProvider & {
  provider: "saml";
  entity_id: string;
  sso_url: string;
  certificate: string;
  disable_requested_authn_context: boolean;
};

// Discriminated union - TypeScript narrows based on 'provider' field
export type TIdentityProvider = TIdentityProviderOIDC | TIdentityProviderSAML;

// Type guards for runtime type narrowing
export const isOIDCProvider = (provider: TIdentityProvider): provider is TIdentityProviderOIDC =>
  provider.provider === "oidc";

export const isSAMLProvider = (provider: TIdentityProvider): provider is TIdentityProviderSAML =>
  provider.provider === "saml";

export type TCreateOIDCProviderRequest = Pick<
  TIdentityProviderOIDC,
  | "client_id"
  | "client_secret"
  | "authorize_url"
  | "token_url"
  | "userinfo_url"
  | "logout_url"
  | "is_enabled"
  | "provider"
>;

export type TCreateSAMLProviderRequest = Pick<
  TIdentityProviderSAML,
  "entity_id" | "sso_url" | "certificate" | "logout_url" | "is_enabled" | "provider" | "disable_requested_authn_context"
>;

// Update types - partial, excluding provider (can't change provider type)
export type TUpdateOIDCProviderRequest = Partial<Omit<TCreateOIDCProviderRequest, "provider">>;
export type TUpdateSAMLProviderRequest = Partial<Omit<TCreateSAMLProviderRequest, "provider">>;
export type TUpdateProviderRequest = TUpdateOIDCProviderRequest | TUpdateSAMLProviderRequest;
