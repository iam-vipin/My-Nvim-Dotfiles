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

import * as Y from "yjs";
import type { DocumentAction } from "@/types/document-action";
import { deleteNode, findAllElementsRecursive } from "@/utils/xml-tree";
import { ActionRegistry } from "../registries/action-registry";

// Define standard actions
const removeNodeAction: DocumentAction = {
  name: "removeNode",
  execute: (xmlFragment, page, context) => {
    if (!page.id) return;

    // Find all instances of the page embed in the entire document tree
    const matchingEmbeds = findAllElementsRecursive(xmlFragment, "pageEmbedComponent", "entity_identifier", page.id);

    if (matchingEmbeds.length > 0) {
      // Process in reverse order to avoid index shifting problems
      for (let i = matchingEmbeds.length - 1; i >= 0; i--) {
        const { parent, indexInParent } = matchingEmbeds[i];
        deleteNode(parent, indexInParent);
      }

      // Update the set since we've removed instances
      if (context.embeddedIDs) {
        context.embeddedIDs.delete(page.id);
      }
    }
  },
};

const addPageEmbedAction: DocumentAction = {
  name: "addPageEmbed",
  execute: (xmlFragment, page, _context) => {
    if (!page.id) return;

    const newEmbed = new Y.XmlElement("pageEmbedComponent");
    newEmbed.setAttribute("entity_identifier", page.id);
    xmlFragment.push([newEmbed]);
  },
};

const addNodeBelowTargetAction: DocumentAction = {
  name: "addNodeBelowTarget",
  execute: (xmlFragment, page, context) => {
    if (!page.id) return;

    const { targetId } = context;
    if (!targetId) {
      // Fall back to adding at the end if no target is specified
      addPageEmbedAction.execute(xmlFragment, page, context);
      return;
    }

    // Find all instances of the target in the entire document tree
    const matchingTargets = findAllElementsRecursive(xmlFragment, "pageEmbedComponent", "entity_identifier", targetId);

    if (matchingTargets.length > 0) {
      // Use the first matching target (we can't insert below all targets)
      const { parent, indexInParent } = matchingTargets[0];

      const newEmbed = new Y.XmlElement("pageEmbedComponent");
      newEmbed.setAttribute("entity_identifier", page.id);

      // Insert after the target node
      parent.insert(indexInParent + 1, [newEmbed]);
    } else {
      // Fall back to adding at the end if target not found
      addPageEmbedAction.execute(xmlFragment, page, context);
    }
  },
};

// Register standard actions
ActionRegistry.register(removeNodeAction);
ActionRegistry.register(addPageEmbedAction);
ActionRegistry.register(addNodeBelowTargetAction);
