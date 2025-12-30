import useSWRMutation from "swr/mutation";
// plane imports
import { ssoDomainService } from "@plane/services";
import type { TCreateDomainRequest, TDomain } from "@plane/types";
// local imports
import { LIST_DOMAINS_KEY } from "./keys";

type TUseDomainActionsReturn = {
  createDomain: (data: TCreateDomainRequest) => Promise<TDomain>;
  deleteDomain: (domainId: string) => Promise<void>;
  verifyDomain: (domainId: string) => Promise<TDomain>;
  isCreating: boolean;
  isDeleting: boolean;
  isVerifying: boolean;
};

/**
 * Hook for domain mutations (create, delete, verify)
 * Uses SWR's `useSWRMutation` which automatically handles cache revalidation
 * @param workspaceSlug The workspace slug
 * @returns Domain mutation functions and loading states
 */
export const useDomainActions = (workspaceSlug: string): TUseDomainActionsReturn => {
  // Use centralized key function for consistent cache management
  const listKey = LIST_DOMAINS_KEY(workspaceSlug);

  // Create domain
  const { trigger: createTrigger, isMutating: isCreating } = useSWRMutation(
    listKey,
    async (_key, { arg }: { arg: TCreateDomainRequest }) => {
      return await ssoDomainService.create(workspaceSlug, arg);
    }
  );

  // Delete domain
  const { trigger: deleteTrigger, isMutating: isDeleting } = useSWRMutation(
    listKey,
    async (_key, { arg: domainId }: { arg: string }) => {
      return await ssoDomainService.destroy(workspaceSlug, domainId);
    }
  );

  // Verify domain
  const { trigger: verifyTrigger, isMutating: isVerifying } = useSWRMutation(
    listKey,
    async (_key, { arg: domainId }: { arg: string }) => {
      return await ssoDomainService.verify(workspaceSlug, domainId);
    }
  );

  return {
    createDomain: createTrigger,
    deleteDomain: deleteTrigger,
    verifyDomain: verifyTrigger,
    isCreating,
    isDeleting,
    isVerifying,
  };
};
