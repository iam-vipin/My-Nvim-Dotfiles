import React from "react";
import { useTranslation } from "@plane/i18n";
import { cn } from "@plane/utils";
import { useClickUpImporter } from "@/plane-web/hooks/store/importers/use-clickup";

interface SkipAdditionalDataToggleProps {
  skipAdditionalData: boolean;
  handleSkipAdditionalDataToggle: (value: boolean) => void;
  className?: string;
}

export function SkipAdditionalDataToggle({
  skipAdditionalData,
  handleSkipAdditionalDataToggle,
  className = "",
}: SkipAdditionalDataToggleProps) {
  const { handleSyncJobConfig } = useClickUpImporter();
  const handleClick = (value: boolean) => {
    handleSkipAdditionalDataToggle(value);
    // update the sync job config
    handleSyncJobConfig("skipAdditionalDataImport", value);
  };

  const { t } = useTranslation();

  const pullAdditionalData = !skipAdditionalData;

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="inline-flex items-center gap-2 cursor-pointer" onClick={() => handleClick(!skipAdditionalData)}>
        <div
          className={cn(
            "flex-shrink-0 w-4 h-4 p-1 relative flex justify-center items-center border border-subtle-1 overflow-hidden rounded-sm transition-all",
            { "border-accent-strong": pullAdditionalData }
          )}
        >
          <div
            className={cn("w-full h-full bg-layer-1 transition-all", {
              "bg-accent-primary": pullAdditionalData,
            })}
          />
        </div>
        <div className="text-13 text-primary">{t("clickup_importer.steps.pull_additional_data_title")}</div>
      </div>
    </div>
  );
}
