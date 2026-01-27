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

import { action, computed, makeObservable, observable, runInAction } from "mobx";
import { ThemeStore as CoreThemeStore } from "@/store/theme.store";
import type { IThemeStore as ICoreThemeStore } from "@/store/theme.store";
import { storage } from "@/lib/local-storage";

// Sidecar type definitions
export type TSidecarType = "pi-chat" | "agent" | null;

type TSidecarState = {
  type: TSidecarType;
  chatId?: string; // for pi-chat
  runId?: string; // for agent
};

const SIDECAR_STATE_KEY = "workspace_sidecar_state";

export interface IThemeStore extends ICoreThemeStore {
  // Sidecar state
  activeSidecar: TSidecarType;
  sidecarChatId: string | undefined;
  sidecarRunId: string | undefined;
  isSidecarOpen: boolean;
  // Sidecar actions
  openPiChatSidecar: (chatId?: string) => void;
  openAgentSidecar: (runId: string) => void;
  closeSidecar: () => void;
  updateSidecarChatId: (chatId: string) => void;
}

export class ThemeStore extends CoreThemeStore implements IThemeStore {
  // Sidecar state
  sidecarState: TSidecarState = { type: null };

  constructor() {
    super();

    makeObservable(this, {
      // observables
      sidecarState: observable,
      // computed
      activeSidecar: computed,
      sidecarChatId: computed,
      sidecarRunId: computed,
      isSidecarOpen: computed,
      // actions
      openPiChatSidecar: action,
      openAgentSidecar: action,
      closeSidecar: action,
      updateSidecarChatId: action,
    });

    // Initialize from localStorage
    this.sidecarState = this.readSidecarStateFromStorage();
  }

  // Computed getters
  get activeSidecar(): TSidecarType {
    return this.sidecarState.type;
  }

  get sidecarChatId(): string | undefined {
    return this.sidecarState.chatId;
  }

  get sidecarRunId(): string | undefined {
    return this.sidecarState.type === "agent" ? this.sidecarState.runId : undefined;
  }

  get isSidecarOpen(): boolean {
    return this.sidecarState.type !== null;
  }

  // Actions
  openPiChatSidecar = (chatId?: string) => {
    runInAction(() => {
      // Preserve existing chatId if none provided, and preserve runId when switching
      this.sidecarState = {
        type: "pi-chat",
        chatId: chatId ?? this.sidecarState.chatId,
      };
    });
    this.persistSidecarState();
  };

  openAgentSidecar = (runId: string) => {
    runInAction(() => {
      this.sidecarState = { type: "agent", runId, chatId: this.sidecarState.chatId };
    });
  };

  closeSidecar = () => {
    runInAction(() => {
      // Preserve chatId and runId for when sidecar is reopened
      this.sidecarState = { type: null, chatId: this.sidecarState.chatId, runId: undefined };
    });
    this.persistSidecarState();
  };

  updateSidecarChatId = (chatId: string) => {
    // Always update chatId so it persists for when pi-chat sidecar is opened later
    runInAction(() => {
      this.sidecarState = { ...this.sidecarState, chatId };
    });
    this.persistSidecarState();
  };

  // Private helpers
  private persistSidecarState() {
    storage.set(SIDECAR_STATE_KEY, JSON.stringify(this.sidecarState));
  }

  private readSidecarStateFromStorage(): TSidecarState {
    try {
      const value = JSON.parse(storage.get(SIDECAR_STATE_KEY) || "{}") as TSidecarState;
      // Preserve chatId and runId even if type is null
      return {
        type: value.type ?? null,
        chatId: value.chatId,
        runId: value.runId,
      };
    } catch {
      return { type: null };
    }
  }
}
