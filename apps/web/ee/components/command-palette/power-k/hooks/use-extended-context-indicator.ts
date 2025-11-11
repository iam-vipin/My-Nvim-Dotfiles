import { useParams } from "next/navigation";
// plane imports
import { useInitiatives } from "@/plane-web/hooks/store/use-initiatives";
// local imports
import type { TPowerKContextTypeExtended } from "../types";

type TArgs = {
  activeContext: TPowerKContextTypeExtended | null;
};

export const useExtendedContextIndicator = (args: TArgs): string | null => {
  const { activeContext } = args;
  // navigation
  const { initiativeId } = useParams();
  // store hooks
  const {
    initiative: { getInitiativeById },
  } = useInitiatives();
  // derived values
  let indicator: string | undefined | null = null;

  switch (activeContext) {
    case "initiative": {
      const initiativeDetails = initiativeId ? getInitiativeById(initiativeId.toString()) : null;
      indicator = initiativeDetails?.name;
      break;
    }
    default: {
      indicator = null;
      break;
    }
  }

  return indicator ?? null;
};
