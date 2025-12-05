import type { Params } from "react-router";
// local imports
import type { TPowerKContextTypeExtended } from "./types";

export const detectExtendedContextFromURL = (params: Params): TPowerKContextTypeExtended | null => {
  if (params.initiativeId) return "initiative";

  return null;
};
