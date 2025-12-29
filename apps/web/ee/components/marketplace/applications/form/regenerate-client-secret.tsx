import { useState } from "react";
import { observer } from "mobx-react";

import { CopyIcon } from "@plane/propel/icons";
// plane imports
import { useTranslation } from "@plane/i18n";
import { Button } from "@plane/propel/button";
import { TOAST_TYPE, setToast } from "@plane/propel/toast";
import { Tooltip } from "@plane/propel/tooltip";
import type { TUserApplication } from "@plane/types";
// helpers
import { copyTextToClipboard } from "@plane/utils";
// hooks
import { usePlatformOS } from "@/hooks/use-platform-os";
import { RegenerateConfirmModal } from "@/plane-web/components/marketplace";

type Props = {
  application: Partial<TUserApplication>;
  handleRegenerateSuccess: (data: Partial<TUserApplication>) => void;
};

export const RegenerateClientSecret = observer(function RegenerateClientSecret(props: Props) {
  const { application, handleRegenerateSuccess } = props;

  // hooks
  const { isMobile } = usePlatformOS();
  const { t } = useTranslation();
  // state
  const [isRegenerateModalOpen, setIsRegenerateModalOpen] = useState(false);

  const copyContent = (value: string, label: string) => {
    copyTextToClipboard(value).then(() =>
      setToast({
        type: TOAST_TYPE.SUCCESS,
        title: `${t("success")}!`,
        message: t(`workspace_settings.settings.applications.${label}_copied`),
      })
    );
  };

  const handleRegenerateModalClose = () => {
    setIsRegenerateModalOpen(false);
  };

  const handleRegenerated = (data: Partial<TUserApplication>) => {
    setIsRegenerateModalOpen(false);
    handleRegenerateSuccess(data);
  };

  return (
    <div className={`mt-4 space-y-2 flex flex-col rounded-md p-4 bg-surface-1`}>
      <div className="font-medium">{t("workspace_settings.settings.applications.client_id_and_secret")}</div>
      <div className="text-13 text-placeholder">
        {t("workspace_settings.settings.applications.regenerate_client_secret_description")}
      </div>
      <div className="space-y-1">
        <p className={`text-13 text-primary`}>{t("workspace_settings.settings.applications.application_id")}</p>
        <button
          type="button"
          onClick={() => copyContent(application.id ?? "", "applicationId")}
          className={`mt-4 flex truncate w-full items-center justify-between rounded-md border-[0.5px] border-subtle-1 px-3 py-3 text-13 font-medium outline-none bg-surface-1 text-primary`}
        >
          <span className={`truncate pr-2 text-primary`}>{application.id}</span>
          <Tooltip tooltipContent="Copy application id" isMobile={isMobile}>
            <CopyIcon className="h-4 w-4 text-placeholder flex-shrink-0" />
          </Tooltip>
        </button>
      </div>
      <div className="space-y-1">
        <p className={`text-13 text-primary`}>{t("workspace_settings.settings.applications.client_id")}</p>
        <button
          type="button"
          onClick={() => copyContent(application.client_id ?? "", "clientId")}
          className={`mt-4 flex truncate w-full items-center justify-between rounded-md border-[0.5px] border-subtle-1 px-3 py-3 text-13 font-medium outline-none bg-surface-1 text-primary`}
        >
          <span className={`truncate pr-2 text-primary`}>{application.client_id}</span>
          <Tooltip tooltipContent="Copy client id" isMobile={isMobile}>
            <CopyIcon className="h-4 w-4 text-placeholder flex-shrink-0" />
          </Tooltip>
        </button>
      </div>
      <div className="space-y-1">
        <p className={`text-13 text-primary`}>{t("workspace_settings.settings.applications.client_secret")}</p>
        <div
          className={`flex items-center justify-between mt-4 flex truncate w-full items-center justify-between rounded-md border-[0.5px] border-subtle-1 px-3 py-2 text-13 font-medium outline-none bg-surface-1 text-primary`}
        >
          <span className={`truncate pr-2 text-primary`}>{"******************"}</span>
          <div className="flex items-center space-x-2">
            <Button variant="primary" onClick={() => setIsRegenerateModalOpen(true)}>
              {t("workspace_settings.settings.applications.regenerate_client_secret")}
            </Button>
          </div>
        </div>
      </div>
      <RegenerateConfirmModal
        isOpen={isRegenerateModalOpen}
        handleRegenerated={handleRegenerated}
        handleClose={handleRegenerateModalClose}
        applicationId={application.id ?? ""}
      />
    </div>
  );
});
