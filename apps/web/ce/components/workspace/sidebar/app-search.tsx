import { observer } from "mobx-react";
// plane imports
import { useTranslation } from "@plane/i18n";
// components
import { SidebarSearchButton } from "@/components/sidebar/search-button";
// hooks
import { usePowerK } from "@/hooks/store/use-power-k";

export const AppSearch = observer(() => {
  // store hooks
  const { togglePowerKModal } = usePowerK();
  // translation
  const { t } = useTranslation();

  return (
    <button
      type="button"
      className="flex-shrink-0 size-8 aspect-square grid place-items-center rounded hover:bg-custom-sidebar-background-90 outline-none border-[0.5px] border-custom-sidebar-border-300"
      onClick={() => togglePowerKModal(true)}
      aria-label={t("aria_labels.projects_sidebar.open_command_palette")}
    >
      <SidebarSearchButton isActive={false} />
    </button>
  );
});
