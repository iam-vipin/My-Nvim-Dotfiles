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

import { logger } from "@plane/logger";
import type { ExState, Client as PlaneClient } from "@plane/sdk";
import { processBatchPromises } from "@/helpers/methods";
import { protect } from "@/lib";

type TCreateState = {
  source_state: any;
  target_state: Partial<ExState>;
};

/* ----------------------------- State Creation Utilities ----------------------------- */
export const createStates = async (
  jobId: string,
  states: { target_state: Partial<ExState>; source_state: any }[],
  planeClient: PlaneClient,
  workspaceSlug: string,
  projectId: string,
  existingStates: ExState[]
): Promise<{ source_state: any; target_state: Partial<ExState> }[]> => {
  const createState = async (state: TCreateState): Promise<TCreateState | undefined> => {
    try {
      // check if the state already exists (by external_id or by name) BEFORE calling the API
      const existingStateById = existingStates.find(
        (exState) => exState.external_id === state.target_state.external_id
      );
      const existingStateByName = existingStates.find(
        (exState) => exState.name?.trim().toLowerCase() === state.target_state.name?.trim().toLowerCase()
      );
      if (existingStateById || existingStateByName) {
        return {
          source_state: state.source_state,
          target_state: (existingStateById || existingStateByName) as ExState,
        };
      }

      // create if not found
      const newState: ExState = await protect(
        planeClient.state.create.bind(planeClient.state),
        workspaceSlug,
        projectId,
        state.target_state
      );

      // add the new state to the existing states
      existingStates.push(newState);

      return {
        source_state: state.source_state,
        target_state: newState,
      };
    } catch (error) {
      logger.error(`Error while creating the state: ${state.target_state.name}`, {
        jobId: jobId,
        error: error,
      });
      return undefined;
    }
  };
  // batch the state creation
  const createdStates = await processBatchPromises(states, createState, 2);

  return createdStates.filter((state) => state !== undefined);
};
