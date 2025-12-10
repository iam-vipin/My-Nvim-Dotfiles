import { observer } from "mobx-react";
import { CloseIcon, DiceIcon } from "@plane/propel/icons";
// hooks
import { useModule } from "@/hooks/store/use-module";
// ui

type Props = {
  handleRemove: (val: string) => void;
  values: string[];
};

export const AppliedModuleFilters = observer(function AppliedModuleFilters(props: Props) {
  const { handleRemove, values } = props;
  // store hooks
  const { getModuleById } = useModule();

  return (
    <>
      {values.map((moduleId) => {
        const moduleDetails = getModuleById(moduleId) ?? null;

        if (!moduleDetails) return null;

        return (
          <div key={moduleId} className="flex items-center gap-1 rounded bg-custom-background-80 p-1 text-xs truncate">
            <DiceIcon className="h-3 w-3 flex-shrink-0" />
            <span className="normal-case truncate">{moduleDetails.name}</span>
            <button
              type="button"
              className="grid place-items-center text-custom-text-300 hover:text-custom-text-200"
              onClick={() => handleRemove(moduleId)}
            >
              <CloseIcon height={10} width={10} strokeWidth={2} />
            </button>
          </div>
        );
      })}
    </>
  );
});
