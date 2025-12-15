import React from "react";
import { useTranslation } from "@plane/i18n";
import { cn } from "@plane/utils";

interface SkipUserImportProps {
  importSourceName?: string;
  userSkipToggle: boolean;
  handleUserSkipToggle: (value: boolean) => void;
  className?: string;
}

export function SkipUserImport({
  importSourceName = "Jira",
  userSkipToggle,
  handleUserSkipToggle,
  className = "",
}: SkipUserImportProps) {
  const handleClick = (value: boolean) => {
    handleUserSkipToggle(value);
  };

  const { t } = useTranslation();

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="inline-flex items-center gap-2 cursor-pointer" onClick={() => handleClick(!userSkipToggle)}>
        <div
          className={cn(
            "flex-shrink-0 w-4 h-4 p-1 relative flex justify-center items-center border border-subtle-1 overflow-hidden rounded-sm transition-all",
            { "border-accent-strong": userSkipToggle }
          )}
        >
          <div
            className={cn("w-full h-full bg-layer-1 transition-all", {
              "bg-accent-primary": userSkipToggle,
            })}
          />
        </div>
        <div className="text-13 text-primary">{t("importers.skip_user_import_title")}</div>
      </div>

      {userSkipToggle && (
        <div className="text-13 text-red-500">
          {t("importers.skip_user_import_description", { serviceName: importSourceName })}
        </div>
      )}
    </div>
  );
}
