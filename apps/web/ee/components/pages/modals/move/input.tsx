import { useMemo } from "react";
import { useParams } from "next/navigation";
import { Search } from "lucide-react";
import { Combobox } from "@headlessui/react";
// plane imports
import { useTranslation } from "@plane/i18n";

type Props = {
  canPageBeMovedToTeamspace: boolean;
  searchTerm: string;
  updateSearchTerm: (searchTerm: string) => void;
};

export function MovePageModalInput(props: Props) {
  const { canPageBeMovedToTeamspace, searchTerm, updateSearchTerm } = props;
  // navigation
  const { teamspaceId, projectId } = useParams();
  // translation
  const { t } = useTranslation();

  const placeholder = useMemo(() => {
    if (teamspaceId) {
      return t("page_actions.move_page.placeholders.teamspace_to_all");
    }
    if (projectId) {
      if (canPageBeMovedToTeamspace) {
        return t("page_actions.move_page.placeholders.project_to_all");
      }
      return t("page_actions.move_page.placeholders.project_to_project");
    }
    if (canPageBeMovedToTeamspace) {
      return t("page_actions.move_page.placeholders.workspace_to_all");
    }
    return t("page_actions.move_page.placeholders.workspace_to_project");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canPageBeMovedToTeamspace, projectId, teamspaceId]);

  return (
    <div className="flex items-center gap-2 px-4">
      <Search className="flex-shrink-0 size-4 text-custom-text-400" aria-hidden="true" />
      <Combobox.Input
        className="h-12 w-full border-0 bg-transparent text-sm text-custom-text-100 outline-none placeholder:text-custom-text-400 focus:ring-0"
        placeholder={placeholder}
        displayValue={() => ""}
        value={searchTerm}
        onChange={(e) => updateSearchTerm(e.target.value)}
      />
    </div>
  );
}
