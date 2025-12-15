import { observer } from "mobx-react";
import { Globe2, Lock } from "lucide-react";
// plane imports
import { NETWORK_CHOICES } from "@plane/constants";
import { useTranslation } from "@plane/i18n";
import { CloseIcon } from "@plane/propel/icons";
import type { TProjectAccess } from "@/plane-web/types/workspace-project-filters";

type Props = {
  handleRemove: (val: TProjectAccess) => void;
  appliedFilters: TProjectAccess[];
  editable: boolean | undefined;
};

export const AppliedAccessFilters = observer(function AppliedAccessFilters(props: Props) {
  const { handleRemove, appliedFilters, editable } = props;
  // plane imports
  const { t } = useTranslation();
  return (
    <>
      {appliedFilters.map((access) => {
        const accessDetails = NETWORK_CHOICES.find((a) => `${a.labelKey.toLowerCase()}` == access);
        if (!accessDetails) return null;
        return (
          <div key={access} className="flex items-center gap-1 rounded-sm p-1 text-11 bg-layer-1">
            {accessDetails.key === 0 ? <Globe2 className={`h-3 w-3`} /> : <Lock className={`h-3 w-3`} />}
            {t(accessDetails.i18n_label)}
            {editable && (
              <button
                type="button"
                className="grid place-items-center text-tertiary hover:text-secondary"
                onClick={() => handleRemove(access)}
              >
                <CloseIcon height={10} width={10} strokeWidth={2} />
              </button>
            )}
          </div>
        );
      })}
    </>
  );
});
