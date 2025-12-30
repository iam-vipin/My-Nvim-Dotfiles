import { useMemo } from "react";
import useSWR from "swr";
// plane imports
import { ssoDomainService } from "@plane/services";
import type { TDomain } from "@plane/types";
// plane web hooks
import { useFlag } from "@/plane-web/hooks/store/use-flag";
// local imports
import { LIST_DOMAINS_KEY } from "./keys";

type TUseDomainsReturn = {
  domains: TDomain[] | undefined;
  isLoading: boolean;
  error: Error | undefined;
  mutate: () => Promise<void>;
  // Derived values
  domainIds: string[];
  hasAnyVerifiedDomain: boolean;
  getDomainById: (id: string) => TDomain | undefined;
};

/**
 * Hook to fetch SSO domains with derived values (read-only)
 * Directly uses `useSWR` to fetch domains list. Only fetches when `CLOUD_SSO` feature flag is enabled.
 * For mutations (create, delete, verify), use the `useDomainActions` hook.
 * @param workspaceSlug The workspace slug
 * @returns Domain data, loading state, and derived values
 */
export const useDomains = (workspaceSlug: string): TUseDomainsReturn => {
  // Check if SSO feature is enabled for this workspace
  const isEnabled = useFlag(workspaceSlug, "CLOUD_SSO");
  // Direct SWR fetch - only fetches when feature flag is enabled
  const {
    data: domains,
    isLoading,
    error,
    mutate,
  } = useSWR<TDomain[], Error | undefined>(
    isEnabled ? LIST_DOMAINS_KEY(workspaceSlug) : null,
    isEnabled ? () => ssoDomainService.list(workspaceSlug) : null
  );

  // Derived values computed from fetched domains data
  const domainIds = useMemo(() => domains?.map((d) => d.id) || [], [domains]);
  const hasAnyVerifiedDomain = useMemo(
    () => domains?.some((d) => d.verification_status === "verified") || false,
    [domains]
  );
  const getDomainById = useMemo(() => (id: string) => domains?.find((d) => d.id === id), [domains]);

  return {
    domains,
    isLoading,
    error: error,
    mutate: async () => {
      await mutate();
    },
    domainIds,
    hasAnyVerifiedDomain,
    getDomainById,
  };
};
