import { CircleChevronRight } from "lucide-react";
import { TrashIcon } from "@plane/propel/icons";
// plane imports
import { useTranslation } from "@plane/i18n";
import { Tooltip } from "@plane/propel/tooltip";

type Props = {
  handleClose: () => void;
  handleDelete: () => void;
};

export function WidgetConfigSidebarHeader(props: Props) {
  const { handleClose, handleDelete } = props;
  // translation
  const { t } = useTranslation();

  return (
    <div className="flex-shrink-0 flex items-center justify-between gap-2">
      <div className="flex-shrink-0">
        <button
          type="button"
          className=" grid place-items-center text-icon-secondary bg-layer-transparent hover:bg-layer-transparent-hover hover:text-primary transition-colors p-1 rounded-md"
          onClick={handleClose}
        >
          <CircleChevronRight className="size-3.5" />
        </button>
      </div>
      <div className="flex-shrink-0">
        <Tooltip tooltipContent={t("common.delete")}>
          <button
            type="button"
            onClick={handleDelete}
            className="size-4 grid place-items-center text-icon-secondary bg-layer-transparent hover:text-icon-danger transition-colors bg"
          >
            <TrashIcon className="size-3.5" />
          </button>
        </Tooltip>
      </div>
    </div>
  );
}
