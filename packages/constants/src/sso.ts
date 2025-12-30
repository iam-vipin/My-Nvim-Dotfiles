/**
 * SSO Error Codes
 * These match the error codes defined in the backend
 * Reference: apps/api/plane/authentication/adapter/error.py
 */
export const SSO_ERROR_CODES = {
  // Domain errors
  DOMAIN_REQUIRED: "5200",
  DOMAIN_NOT_FOUND: "5205",
  DOMAIN_NOT_VERIFIED: "5210",
  DOMAIN_VERIFICATION_FAILED: "5215",
  DOMAIN_ALREADY_VERIFIED_FOR_ANOTHER_WORKSPACE: "5220",
  DOMAIN_ALREADY_ASSOCIATED_WITH_WORKSPACE: "5225",
  // Workspace errors
  WORKSPACE_NOT_FOUND: "5230",
  // Provider errors
  INVALID_PROVIDER: "5235",
  // OIDC errors
  OIDC_NOT_CONFIGURED: "5240",
  OIDC_CONFIGURATION_INCOMPLETE: "5245",
  OIDC_ALREADY_CONFIGURED: "5250",
  OIDC_PROVIDER_ERROR: "5255",
  // SAML errors
  SAML_NOT_CONFIGURED: "5260",
  SAML_PROVIDER_ERROR: "5265",
} as const;

export type TSSOErrorCodes = (typeof SSO_ERROR_CODES)[keyof typeof SSO_ERROR_CODES];

/**
 * Helper to get user-friendly error messages for SSO error codes
 */
export const SSO_ERROR_MESSAGES: Record<TSSOErrorCodes, string> = {
  [SSO_ERROR_CODES.DOMAIN_REQUIRED]: "Domain name is required",
  [SSO_ERROR_CODES.DOMAIN_NOT_FOUND]: "Domain not found",
  [SSO_ERROR_CODES.DOMAIN_NOT_VERIFIED]: "Domain is not verified",
  [SSO_ERROR_CODES.DOMAIN_VERIFICATION_FAILED]: "Domain verification failed. Please check your DNS records.",
  [SSO_ERROR_CODES.DOMAIN_ALREADY_VERIFIED_FOR_ANOTHER_WORKSPACE]:
    "This domain is already verified for another workspace",
  [SSO_ERROR_CODES.DOMAIN_ALREADY_ASSOCIATED_WITH_WORKSPACE]: "This domain is already associated with this workspace",
  [SSO_ERROR_CODES.WORKSPACE_NOT_FOUND]: "Workspace not found",
  [SSO_ERROR_CODES.INVALID_PROVIDER]: "Invalid identity provider",
  [SSO_ERROR_CODES.OIDC_NOT_CONFIGURED]: "OIDC is not configured",
  [SSO_ERROR_CODES.OIDC_CONFIGURATION_INCOMPLETE]: "OIDC configuration is incomplete",
  [SSO_ERROR_CODES.OIDC_ALREADY_CONFIGURED]: "OIDC is already configured for this workspace",
  [SSO_ERROR_CODES.OIDC_PROVIDER_ERROR]: "OIDC provider error occurred",
  [SSO_ERROR_CODES.SAML_NOT_CONFIGURED]: "SAML is not configured",
  [SSO_ERROR_CODES.SAML_PROVIDER_ERROR]: "SAML provider error occurred",
};

export const isSSOErrorCode = (code: string): code is TSSOErrorCodes => {
  return Object.values(SSO_ERROR_CODES).some((errorCode) => errorCode === code);
};
