import { observer } from "mobx-react";
import { PlusIcon, BriefcaseIcon } from "lucide-react";
// plane imports
import { useTranslation } from "@plane/i18n";
import { Button } from "@plane/propel/button";
import { EpicIcon } from "@plane/propel/icons";
import { CustomMenu } from "@plane/ui";
// plane web imports
import { useInitiatives } from "@/plane-web/hooks/store/use-initiatives";

type Props = {
  customButton?: React.ReactNode;
  disabled?: boolean;
};

export const AddScopeButton = observer(function AddScopeButton(props: Props) {
  const { customButton, disabled } = props;
  // store hooks
  const {
    initiative: { toggleProjectsModal, toggleEpicModal },
  } = useInitiatives();
  const { t } = useTranslation();

  // options
  const optionItems = [
    {
      i18n_label: "common.epics",
      icon: <EpicIcon className="h-3 w-3" />,
      onClick: () => toggleEpicModal(true),
    },
    {
      i18n_label: "common.projects",
      icon: <BriefcaseIcon className="h-3 w-3" />,
      onClick: () => toggleProjectsModal(true),
    },
  ];

  const customButtonElement = customButton ? (
    <>{customButton}</>
  ) : (
    <Button variant="neutral-primary" size="sm">
      <PlusIcon className="size-4" />
      {t("initiatives.scope.add_scope")}
    </Button>
  );

  return (
    <>
      <CustomMenu customButton={customButtonElement} placement="bottom-start" disabled={disabled} closeOnSelect>
        {optionItems.map((item, index) => (
          <CustomMenu.MenuItem
            key={index}
            onClick={() => {
              item.onClick();
            }}
          >
            <div className="flex items-center gap-2">
              {item.icon}
              <span>{t(item.i18n_label)}</span>
            </div>
          </CustomMenu.MenuItem>
        ))}
      </CustomMenu>
    </>
  );
});
