import { useTranslation } from "@plane/i18n";
import type { TImporterConfig } from "./common/dashboard/base-dashboard";
export interface IImporterHeaderProps<T> {
  config: Partial<TImporterConfig<T>>;
  actions?: React.ReactNode;
  description?: string;
}

function ImporterHeader<T>(props: IImporterHeaderProps<T>) {
  const { config, actions, description } = props;
  const { serviceName, logo } = config;
  const { t } = useTranslation();
  return (
    <div className="relative flex flex-col justify-between w-full border-b border-subtle pb-3.5 gap-4">
      <div className="flex justify-between w-full">
        <div className="relative flex gap-3">
          <img src={logo} className="size-8" alt={`${serviceName} ${t("importers.logo")}`} />
          <div className="flex flex-col gap-1">
            <div className="text-18 font-medium my-auto">{serviceName}</div>
            {description && <div className="text-13 text-secondary">{description}</div>}
          </div>
        </div>
        {actions && actions}
      </div>
    </div>
  );
}

export default ImporterHeader;
