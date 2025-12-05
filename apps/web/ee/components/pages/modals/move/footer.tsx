// plane imports
import { useTranslation } from "@plane/i18n";
import { Button } from "@plane/ui";

type Props = {
  disabled: boolean;
  isMoving: boolean;
  onClose: () => void;
  onMove: () => void;
};

export const MovePageModalFooter: React.FC<Props> = (props) => {
  const { onClose, onMove, isMoving, disabled } = props;
  // translation
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-end gap-2 p-3">
      <Button variant="neutral-primary" size="sm" onClick={onClose}>
        {t("common.cancel")}
      </Button>
      <Button variant="primary" size="sm" onClick={onMove} loading={isMoving} disabled={disabled}>
        {isMoving
          ? t("page_actions.move_page.submit_button.loading")
          : t("page_actions.move_page.submit_button.default")}
      </Button>
    </div>
  );
};
