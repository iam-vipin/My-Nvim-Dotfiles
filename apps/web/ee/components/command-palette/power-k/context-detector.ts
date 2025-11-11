import type { Params } from "next/dist/shared/lib/router/utils/route-matcher";
// local imports
import type { TPowerKContextTypeExtended } from "./types";

export const detectExtendedContextFromURL = (params: Params): TPowerKContextTypeExtended | null => {
  if (params.initiativeId) return "initiative";

  return null;
};
