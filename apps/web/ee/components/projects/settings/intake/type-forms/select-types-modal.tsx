import { useMemo, useState } from "react";
import { observer } from "mobx-react";
import { useParams } from "next/navigation";
import { Search } from "lucide-react";
import { useTranslation } from "@plane/i18n";
import { Button } from "@plane/propel/button";
import { EModalPosition, EModalWidth, Input, ModalCore } from "@plane/ui";
import useDebounce from "@/hooks/use-debounce";
import { IssueTypeIdentifier } from "@/plane-web/components/issues/issue-details/issue-identifier";
import { useIssueTypes } from "@/plane-web/hooks/store";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (typeId: string) => void;
};

export const SelectTypesModal = observer((props: Props) => {
  const { isOpen, onClose, onSelect } = props;
  // router
  const { projectId } = useParams();
  // states
  const [searchQuery, setSearchQuery] = useState("");

  //hooks
  const { getProjectIssueTypes } = useIssueTypes();
  const { t } = useTranslation();

  // derived values
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const projectWorkItemTypes = useMemo(
    () => (projectId ? getProjectIssueTypes(projectId.toString(), true) : {}),
    [projectId, getProjectIssueTypes]
  );

  const filteredWorkItemTypes = useMemo(
    () =>
      Object.values(projectWorkItemTypes).filter(
        (issueType) => issueType.name?.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ?? true
      ),
    [debouncedSearchQuery, projectWorkItemTypes]
  );

  const handleSelect = (typeId: string) => {
    onSelect(typeId);
    onClose();
  };

  return (
    <ModalCore isOpen={isOpen} handleClose={onClose} position={EModalPosition.TOP} width={EModalWidth.MD}>
      <div className="p-4">
        <h3 className="text-lg font-medium text-custom-text-200 pb-2">
          {t("intake_forms.type_forms.select_types.title")}
        </h3>
        <div className="flex gap-2 border border-custom-border-200 items-center rounded-md px-2 py-1 mb-2">
          <Search className="size-3 text-custom-text-300" />
          <Input
            placeholder={t("intake_forms.type_forms.select_types.search_placeholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="outline-none border-none w-full text-sm p-0"
          />
        </div>
        {/* Search Results */}
        <div className="space-y-3 mt-3">
          {filteredWorkItemTypes.map((type) => {
            if (!type.id) return;
            return (
              <div
                className="flex items-center gap-2 cursor-pointer"
                key={type.id}
                onClick={() => handleSelect(type.id as string)}
              >
                <IssueTypeIdentifier issueTypeId={type.id} size="md" />
                <span className="text-sm text-custom-text-300">{type.name}</span>
              </div>
            );
          })}
        </div>
        <div className="flex justify-end border-t border-custom-border-200 pt-2 mt-2">
          <Button variant="neutral-primary" size="sm" onClick={onClose}>
            {t("common.cancel")}
          </Button>
        </div>
      </div>
    </ModalCore>
  );
});
