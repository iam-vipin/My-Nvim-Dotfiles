export const LIST_DOMAINS_KEY = (workspaceSlug: string) => `SSO_DOMAINS_${workspaceSlug}`;
export const LIST_PROVIDERS_KEY = (workspaceSlug: string) => `SSO_PROVIDERS_${workspaceSlug}`;
export const GET_DOMAIN_KEY = (workspaceSlug: string, domainId: string) => `SSO_DOMAIN_${workspaceSlug}_${domainId}`;
export const GET_PROVIDER_KEY = (workspaceSlug: string, providerId: string) =>
  `SSO_PROVIDER_${workspaceSlug}_${providerId}`;
