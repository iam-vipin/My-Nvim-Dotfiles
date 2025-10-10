import { TDropTarget } from "@plane/types";
import { TInitiativeLabel } from "@/plane-web/types/initiative";

/**
 * This provides a boolean to indicate if the label can be dropped onto the droptarget
 * @param source
 * @param label
 * @param isCurrentChild if the dropTarget is a child
 * @returns
 */
export const getInitiativeCanDrop = (source: TDropTarget, label: TInitiativeLabel | undefined) => {
  const sourceData = source?.data;

  if (!sourceData) return false;

  // a label cannot be dropped on to itself
  if (sourceData.id === label?.id) return false;
  return true;
};

/**
 * Converts store labels map to array, falling back to default options if store is empty
 * @param storeLabels - Map of labels from store
 * @param defaultOptions - Default options to fall back to
 * @returns Array of initiative labels
 */
export const getInitiativeLabelsArray = (
  storeLabels: Map<string, TInitiativeLabel> | undefined,
  defaultOptions: TInitiativeLabel[] = []
): TInitiativeLabel[] => {
  if (storeLabels && storeLabels.size > 0) {
    return Array.from(storeLabels.values());
  }
  return defaultOptions;
};
