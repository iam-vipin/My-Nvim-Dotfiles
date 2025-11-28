import { useParams } from "next/navigation";
// plane imports
import type { TPowerKContextType } from "@/components/power-k/core/types";
import { useInitiatives } from "@/plane-web/hooks/store/use-initiatives";

type TArgs = {
  activeContext: TPowerKContextType | null;
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
