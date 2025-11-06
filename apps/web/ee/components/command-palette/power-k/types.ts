export type TPowerKContextTypeExtended = "initiative";

export type TPowerKPageTypeExtended =
  | "open-teamspace"
  | "open-initiative"
  | "open-customer"
  // initiative context based actions
  | "change-initiative-state"
  | "change-initiative-lead";

export type TPowerKSearchResultsKeysExtended = "epic" | "team" | "initiative";
