import { INITIATIVE_STATES } from "@plane/constants";
import type {
  TCreateUpdateInitiativeModal,
  TBaseLayoutType,
  TInitiativeGroupByOptions,
  TInitiativeOrderByOptions,
} from "@plane/types";

export const DEFAULT_CREATE_UPDATE_INITIATIVE_MODAL_DATA: TCreateUpdateInitiativeModal = {
  isOpen: false,
  initiativeId: undefined,
};

export const INITIATIVE_GROUP_BY_OPTIONS: {
  key: TInitiativeGroupByOptions;
  title: string;
}[] = [
  { key: "lead", title: "Lead" },
  { key: "created_by", title: "Created By" },
  { key: "state", title: "States" },
  { key: "label_ids", title: "Labels" },
  { key: undefined, title: "None" },
];

export const INITIATIVE_ORDER_BY_OPTIONS: {
  key: TInitiativeOrderByOptions;
  title: string;
}[] = [
  { key: "-created_at", title: "Last Created" },
  { key: "-updated_at", title: "Last Updated" },
];

export const DEFAULT_INITIATIVE_STATE = INITIATIVE_STATES.DRAFT.key;
export const DEFAULT_INITIATIVE_LAYOUT: TBaseLayoutType = "list";
