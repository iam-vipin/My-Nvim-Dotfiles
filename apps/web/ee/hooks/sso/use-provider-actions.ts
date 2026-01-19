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

import useSWRMutation from "swr/mutation";
// plane imports
import { ssoProviderService } from "@plane/services";
import type {
  TCreateOIDCProviderRequest,
  TCreateSAMLProviderRequest,
  TIdentityProvider,
  TUpdateProviderRequest,
} from "@plane/types";
// local imports
import { LIST_PROVIDERS_KEY } from "./keys";

type TUseProviderActionsReturn = {
  createProvider: (data: TCreateOIDCProviderRequest | TCreateSAMLProviderRequest) => Promise<TIdentityProvider>;
  deleteProvider: (providerId: string) => Promise<void>;
  updateProvider: (providerId: string, data: TUpdateProviderRequest) => Promise<TIdentityProvider>;
  isCreating: boolean;
  isDeleting: boolean;
  isUpdating: boolean;
};

/**
 * Hook for provider mutations (create, delete, update)
 * Uses SWR's `useSWRMutation` which automatically handles cache revalidation
 * @param workspaceSlug The workspace slug
 * @returns Provider mutation functions and loading states
 */
export const useProviderActions = (workspaceSlug: string): TUseProviderActionsReturn => {
  // Use centralized key functions for consistent cache management
  const listKey = LIST_PROVIDERS_KEY(workspaceSlug);

  // Create provider
  const { trigger: createTrigger, isMutating: isCreating } = useSWRMutation(
    listKey,
    async (_key, { arg }: { arg: TCreateOIDCProviderRequest | TCreateSAMLProviderRequest }) => {
      return await ssoProviderService.create(workspaceSlug, arg);
    }
  );

  // Delete provider
  const { trigger: deleteTrigger, isMutating: isDeleting } = useSWRMutation(
    listKey,
    async (_key, { arg: providerId }: { arg: string }) => {
      return await ssoProviderService.destroy(workspaceSlug, providerId);
    }
  );

  // Update provider
  const { trigger: updateTrigger, isMutating: isUpdating } = useSWRMutation(
    listKey,
    async (_key, { arg }: { arg: { providerId: string; data: TUpdateProviderRequest } }) => {
      return await ssoProviderService.update(workspaceSlug, arg.providerId, arg.data);
    }
  );

  return {
    createProvider: createTrigger,
    deleteProvider: deleteTrigger,
    updateProvider: (providerId: string, data: TUpdateProviderRequest) => {
      return updateTrigger({ providerId, data });
    },
    isCreating,
    isDeleting,
    isUpdating,
  };
};
