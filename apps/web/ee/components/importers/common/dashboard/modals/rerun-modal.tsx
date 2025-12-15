import type { FC } from "react";
import { useTranslation } from "@plane/i18n";
import { Button } from "@plane/propel/button";

interface IRerunModalProps {
  onClose: () => void;
  onSubmit: () => void;
  isLoading: boolean;
}

export function RerunModal({ onClose, onSubmit, isLoading }: IRerunModalProps) {
  const { t } = useTranslation();
  return (
    <div className="space-y-5 p-5">
      <div className="space-y-2">
        <div className="text-18 font-medium text-secondary">{t("importers.re_run_import_job")}</div>
        <div className="text-13 text-tertiary">{t("importers.re_run_import_job_confirmation")}</div>
      </div>
      <div className="relative flex justify-end items-center gap-2">
        <Button variant="secondary" onClick={onClose}>
          {t("common.cancel")}
        </Button>
        <Button variant="primary" onClick={onSubmit} loading={isLoading} disabled={isLoading}>
          {isLoading ? t("common.processing") : t("common.continue")}
        </Button>
      </div>
    </div>
  );
}
