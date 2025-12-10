// core
import type { TPowerKModalPageDetails } from "@/components/power-k/ui/modal/constants";
// local imports
import type { TPowerKPageTypeExtended } from "./types";

export const POWER_K_MODAL_PAGE_DETAILS_EXTENDED: Record<TPowerKPageTypeExtended, TPowerKModalPageDetails> = {
  "open-teamspace": {
    i18n_placeholder: "power_k.page_placeholders.open_teamspace",
  },
  "open-initiative": {
    i18n_placeholder: "power_k.page_placeholders.open_initiative",
  },
  "open-customer": {
    i18n_placeholder: "power_k.page_placeholders.open_customer",
  },
  "change-initiative-state": {
    i18n_placeholder: "power_k.page_placeholders.change_initiative_state",
  },
  "change-initiative-lead": {
    i18n_placeholder: "power_k.page_placeholders.change_initiative_lead",
  },
};
