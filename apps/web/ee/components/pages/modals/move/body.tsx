import { AlertCircle } from "lucide-react";
import { Combobox } from "@headlessui/react";
// plane imports
import { useTranslation } from "@plane/i18n";
// local imports
import { MovePageModalSections } from "./sections/root";

type Props = {
  canPageBeMovedToTeamspace: boolean;
  searchTerm: string;
};

export function MovePageModalBody(props: Props) {
  const { canPageBeMovedToTeamspace, searchTerm } = props;
  // translation
  const { t } = useTranslation();

  return (
    <Combobox.Options static className="vertical-scrollbar scrollbar-md max-h-80 scroll-py-2 overflow-y-auto">
      {!canPageBeMovedToTeamspace && (
        <section className="mb-3 px-2">
          <div className="p-2 bg-custom-background-80 rounded flex items-center gap-2 text-custom-text-300">
            <AlertCircle className="shrink-0 size-3.5" />
            <p className="text-xs font-medium">{t("page_actions.move_page.cannot_move_to_teamspace")}</p>
          </div>
        </section>
      )}
      <MovePageModalSections canPageBeMovedToTeamspace={canPageBeMovedToTeamspace} searchTerm={searchTerm} />
    </Combobox.Options>
  );
}
