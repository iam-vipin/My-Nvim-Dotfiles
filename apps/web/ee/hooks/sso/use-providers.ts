import { useMemo } from "react";
import useSWR from "swr";
// plane imports
import { ssoProviderService } from "@plane/services";
import { isOIDCProvider, isSAMLProvider } from "@plane/types";
import type { TIdentityProvider, TIdentityProviderOIDC, TIdentityProviderSAML } from "@plane/types";
// plane web hooks
import { useFlag } from "@/plane-web/hooks/store/use-flag";
// local imports
import { LIST_PROVIDERS_KEY } from "./keys";

type TUseProvidersReturn = {
  providers: TIdentityProvider[] | undefined;
  isLoading: boolean;
  error: Error | undefined;
  mutate: () => Promise<void>;
  // Derived values
  oidcProvider: TIdentityProviderOIDC | undefined;
  samlProvider: TIdentityProviderSAML | undefined;
  activeProvider: TIdentityProvider | undefined;
};

/**
 * Hook to fetch SSO providers with derived values (read-only)
 * Directly uses `useSWR` to fetch providers list. Only fetches when `CLOUD_SSO` feature flag is enabled.
 * For mutations (create, delete, update), use the `useProviderActions` hook.
 * @param workspaceSlug The workspace slug
 * @returns Provider data, loading state, and derived values
 */
export const useProviders = (workspaceSlug: string): TUseProvidersReturn => {
  // Check if SSO feature is enabled for this workspace
  const isEnabled = useFlag(workspaceSlug, "CLOUD_SSO");
  // Direct SWR fetch - only fetches when feature flag is enabled
  const {
    data: providers,
    isLoading,
    error,
    mutate,
  } = useSWR<TIdentityProvider[], Error | undefined>(
    isEnabled ? LIST_PROVIDERS_KEY(workspaceSlug) : null,
    isEnabled ? () => ssoProviderService.list(workspaceSlug) : null
  );

  // Derived values computed from fetched providers data
  const oidcProvider = useMemo(() => {
    return providers?.find((provider) => isOIDCProvider(provider));
  }, [providers]);

  const samlProvider = useMemo(() => {
    return providers?.find((provider) => isSAMLProvider(provider));
  }, [providers]);

  const activeProvider = useMemo(() => {
    if (oidcProvider?.is_enabled) return oidcProvider;
    if (samlProvider?.is_enabled) return samlProvider;
    return undefined;
  }, [oidcProvider, samlProvider]);

  return {
    providers,
    isLoading,
    error: error,
    mutate: async () => {
      await mutate();
    },
    oidcProvider,
    samlProvider,
    activeProvider,
  };
};
