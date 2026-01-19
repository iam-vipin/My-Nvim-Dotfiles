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

import { set } from "lodash-es";
import { action, autorun, makeObservable, observable } from "mobx";
// Store
import { computedFn } from "mobx-utils";
import type { TGanttBlockGroup } from "@plane/types";
import { EGanttBlockType } from "@plane/types";
import type { RootStore } from "@/plane-web/store/root.store";
import type { IBaseTimelineStore } from "@/plane-web/store/timeline/base-timeline.store";
import { BaseTimeLineStore } from "@/plane-web/store/timeline/base-timeline.store";

export class GroupedTimeLineStore extends BaseTimeLineStore implements IBaseTimelineStore {
  blockGroups: EGanttBlockType[] = [];
  originalBlockIdsByType: Record<EGanttBlockType, string[]> = {} as Record<EGanttBlockType, string[]>;

  constructor(_rootStore: RootStore) {
    super(_rootStore);

    makeObservable(this, {
      blockGroups: observable,
      originalBlockIdsByType: observable,
      setBlockGroups: action,
    });

    autorun(() => {
      if (this.blockGroups.length) {
        this.blockGroups.forEach((group, n) => {
          const type = group;
          const index = n + 1;
          if (type === EGanttBlockType.EPIC) {
            this.updateBlocks(this.rootStore.issue.issues.getIssueById, type, index);
          } else if (type === EGanttBlockType.PROJECT) {
            this.updateBlocks(this.rootStore.projectRoot.project.getProjectById, type, index);
          }
        });
      }
    });
  }

  setBlockGroups = (groupData: TGanttBlockGroup[]) => {
    this.setGrouping(true);
    const blockGroups = groupData.map((group) => {
      const type = group.type;
      return type;
    });
    set(this, "blockGroups", blockGroups);

    // Store original block IDs per type for accurate counting
    const originalBlockIdsByType: Record<EGanttBlockType, string[]> = {} as Record<EGanttBlockType, string[]>;
    groupData.forEach((group) => {
      originalBlockIdsByType[group.type] = group.blockIds;
    });
    this.originalBlockIdsByType = originalBlockIdsByType;

    // Flatten all the block ids
    const flattenedBlockIds = groupData.flatMap((group) => group.blockIds);
    this.setBlockIds(flattenedBlockIds);
  };

  getGroupedBlockIds = computedFn((): TGanttBlockGroup[] => {
    const groupBlockIds: TGanttBlockGroup[] = this.blockGroups.map((group) => ({
      type: group,
      blockIds: [],
      count: 0,
    }));

    if (!this.blockIds) return groupBlockIds;

    // Use original block IDs for counting to ensure accurate count even when collapsed
    this.blockGroups.forEach((groupType) => {
      const group = groupBlockIds.find((g) => g.type === groupType);
      if (!group) return;

      const originalBlockIds = this.originalBlockIdsByType[groupType] || [];
      // Count from original block IDs to maintain accurate count
      group.count = originalBlockIds.length;

      // Only add blockIds to display if group is not collapsed
      if (!this.collapsedGroups.includes(groupType) && this.blockIds) {
        // Filter to only include blocks that are currently in blockIds (visible)
        const visibleBlockIds = this.blockIds.filter((blockId) => {
          const block = this.blocksMap[blockId];
          return block?.meta?.type === groupType;
        });
        group.blockIds = visibleBlockIds;
      }
    });

    return groupBlockIds;
  });

  // Override toggleGroup to properly restore blocks when expanding using original block IDs
  toggleGroup = (type: EGanttBlockType, open: boolean = false) => {
    const isCurrentlyCollapsed = this.collapsedGroups.includes(type);

    if (open) {
      // Force expand if explicitly requested and currently collapsed
      if (isCurrentlyCollapsed) {
        this.expandGroupWithOriginalIds(type);
      }
    } else {
      // Normal toggle behavior
      if (isCurrentlyCollapsed) {
        this.expandGroupWithOriginalIds(type);
      } else {
        // Collapse: remove blocks of this type from visible block ids
        this.collapsedGroups.push(type);
        const blocksExceptType =
          this.blockIds?.filter((blockId) => {
            const block = this.blocksMap[blockId];
            return block?.meta?.type !== type;
          }) ?? [];
        this.setBlockIds(blocksExceptType);
      }
    }
  };

  private expandGroupWithOriginalIds = (type: EGanttBlockType) => {
    // Remove from collapsed groups
    this.collapsedGroups = this.collapsedGroups.filter((group) => group !== type);

    // Get original block IDs for this type
    const originalBlockIds = this.originalBlockIdsByType[type] || [];

    // Get current block IDs (excluding the type we're expanding to avoid duplicates)
    const currentBlockIds =
      this.blockIds?.filter((blockId) => {
        const block = this.blocksMap[blockId];
        return block?.meta?.type !== type;
      }) ?? [];

    // Combine: add original block IDs of this type back, then add all other current block IDs
    const updatedBlockIds = Array.from(new Set([...originalBlockIds, ...currentBlockIds]));
    this.setBlockIds(updatedBlockIds);
  };
}
