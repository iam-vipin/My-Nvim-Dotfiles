import type { FC } from "react";
import { observer } from "mobx-react";
import { ChevronDownIcon } from "@plane/propel/icons";
import { CustomMenu } from "@plane/ui";
import { cn } from "@plane/utils";
import type { TAiModels } from "@/plane-web/types";

export type TModelsDropdown = {
  className?: string;
  models: TAiModels[];
  activeModel: string | undefined;
  setActiveModel: (model: string) => void;
};

export const ModelsDropdown = observer(function ModelsDropdown(props: TModelsDropdown) {
  const { className, activeModel, models, setActiveModel } = props;
  const activeModelDetails = models.find((model) => model.id === activeModel);
  function DropdownOptions() {
    return models?.map((model) => (
      <CustomMenu.MenuItem
        key={model.id}
        className="flex items-center gap-2 truncate"
        onClick={() => {
          setActiveModel(model.id);
        }}
      >
        <div className="truncate font-medium text-11">{model.name}</div>
      </CustomMenu.MenuItem>
    ));
  }

  return (
    <CustomMenu
      maxHeight={"md"}
      className={cn("flex justify-center text-11 w-fit ", className)}
      placement="bottom-start"
      customButton={
        <button className="flex hover:bg-layer-1 p-2 rounded-md gap-1">
          <span className="text-body-xs-medium my-auto text-secondary">
            Plane AI {activeModelDetails && `(${activeModelDetails?.name})`}
          </span>
          <ChevronDownIcon className={cn("size-3 my-auto text-tertiary hover:text-secondary duration-300")} />
        </button>
      }
      customButtonClassName="flex justify-center"
      closeOnSelect
    >
      <DropdownOptions />
    </CustomMenu>
  );
});
