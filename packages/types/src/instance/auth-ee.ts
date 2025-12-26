export type TExtendedInstanceAuthenticationModeKeys = "oidc" | "saml" | "ldap";

export type TInstanceEnterpriseAuthenticationMethodKeys = "IS_OIDC_ENABLED" | "IS_SAML_ENABLED" | "IS_LDAP_ENABLED";

export type TInstanceOIDCAuthenticationConfigurationKeys =
  | "OIDC_CLIENT_ID"
  | "OIDC_CLIENT_SECRET"
  | "OIDC_TOKEN_URL"
  | "OIDC_USERINFO_URL"
  | "OIDC_AUTHORIZE_URL"
  | "OIDC_LOGOUT_URL"
  | "OIDC_PROVIDER_NAME"
  | "ENABLE_OIDC_IDP_SYNC";

export type TInstanceSAMLAuthenticationConfigurationKeys =
  | "SAML_ENTITY_ID"
  | "SAML_SSO_URL"
  | "SAML_LOGOUT_URL"
  | "SAML_CERTIFICATE"
  | "SAML_PROVIDER_NAME"
  | "ENABLE_SAML_IDP_SYNC";

export type TInstanceLDAPAuthenticationConfigurationKeys =
  | "LDAP_SERVER_URI"
  | "LDAP_BIND_DN"
  | "LDAP_BIND_PASSWORD"
  | "LDAP_USER_SEARCH_BASE"
  | "LDAP_USER_SEARCH_FILTER"
  | "LDAP_USER_ATTRIBUTES"
  | "LDAP_PROVIDER_NAME";

export type TInstanceEnterpriseAuthenticationConfigurationKeys =
  | TInstanceOIDCAuthenticationConfigurationKeys
  | TInstanceSAMLAuthenticationConfigurationKeys
  | TInstanceLDAPAuthenticationConfigurationKeys;

export type TInstanceEnterpriseAuthenticationKeys =
  | TInstanceEnterpriseAuthenticationMethodKeys
  | TInstanceEnterpriseAuthenticationConfigurationKeys;

export type TExtendedLoginMediums = "oidc" | "saml";
