"use client";

import { useMemo } from "react";
import { observer } from "mobx-react";
import { Check } from "lucide-react";
// plane imports
import { useTranslation } from "@plane/i18n";
import { Combobox } from "@plane/propel/combobox";
import { MilestoneIcon } from "@plane/propel/icons";
import { cn } from "@plane/utils";
import { getMilestoneVariant } from "@/plane-web/components/project-overview/details/main/milestones/helper";
import { useMilestones } from "@/plane-web/hooks/store/use-milestone";

type Props = {
  projectId: string;
  value?: string;
  onChange: (milestoneId: string | undefined) => void;
  disabled?: boolean;
  buttonClassName?: string;
  placeholder?: string;
  readonly?: boolean;
};

export const MilestonesDropdown: React.FC<Props> = observer((props) => {
  const {
    projectId,
    value,
    disabled = false,
    buttonClassName = "",
    placeholder = "No milestone",
    readonly = false,
    onChange,
  } = props;

  // plane hooks
  const { t } = useTranslation();
  const { getProjectMilestoneIds, getMilestoneById } = useMilestones();

  // derived values
  const projectMilestoneIds = getProjectMilestoneIds(projectId);
  const projectMilestones = projectMilestoneIds?.map((milestoneId) => getMilestoneById(projectId, milestoneId));

  // Memoize milestone options to avoid recreating on every render
  const milestoneOptions = useMemo(
    () => [
      // None option
      {
        value: "none",
        query: "None",
        content: (
          <div className="flex items-center gap-1">
            <MilestoneIcon className="h-4 w-4 flex-shrink-0" variant="default" />
            <span className="flex-grow truncate text-left">No milestone</span>
          </div>
        ),
        progress_percentage: 0,
      },
      // Milestone options
      ...(projectMilestones
        ?.filter((milestone) => milestone)
        .map((milestone) => ({
          value: milestone!.id,
          query: milestone!.title,
          content: (
            <div className="flex items-center gap-1">
              <MilestoneIcon
                className="h-4 w-4 flex-shrink-0"
                variant={getMilestoneVariant(milestone!.progress_percentage)}
              />
              <span className="flex-grow truncate text-left">{milestone!.title}</span>
            </div>
          ),
          progress_percentage: milestone!.progress_percentage,
        })) || []),
    ],
    [projectMilestones]
  );

  const handleChange = (newValue: string | string[]) => {
    if (typeof newValue === "string") {
      onChange(newValue === "none" ? undefined : newValue);
    }
  };

  const selectedMilestone = value ? milestoneOptions.find((option) => option.value === value) : null;

  return (
    <Combobox value={value || "none"} onValueChange={handleChange} disabled={disabled || readonly}>
      <Combobox.Button
        className={cn(
          "flex h-7 w-full items-center justify-between gap-1 px-2 py-1 rounded-md text-sm hover:bg-custom-background-80",
          buttonClassName
        )}
        disabled={disabled || readonly}
      >
        <div className="flex items-center gap-1">
          {selectedMilestone ? (
            <>
              {value && (
                <MilestoneIcon
                  className="h-4 w-4 flex-shrink-0"
                  variant={getMilestoneVariant(selectedMilestone.progress_percentage)}
                />
              )}
              <span className="flex-grow truncate">{selectedMilestone.query}</span>
            </>
          ) : (
            <span className="text-custom-text-400">{placeholder}</span>
          )}
        </div>
      </Combobox.Button>
      <Combobox.Options
        showSearch
        searchPlaceholder={t("search")}
        emptyMessage={t("no_matching_results")}
        maxHeight="md"
        className="w-48 rounded border-[0.5px] border-custom-border-300 bg-custom-background-100 px-2 py-2.5 text-sm shadow-custom-shadow-rg"
        inputClassName="w-full bg-transparent py-1 text-sm text-custom-text-200 placeholder:text-custom-text-400 focus:outline-none"
        optionsContainerClassName="mt-2 space-y-1"
        positionerClassName="z-50"
        dataPreventOutsideClick
      >
        {milestoneOptions.map((option) => (
          <Combobox.Option
            key={option.value}
            value={option.value}
            className="w-full truncate flex items-center justify-between gap-2 rounded cursor-pointer select-none px-1 py-1.5 hover:bg-custom-background-80 data-[selected]:text-custom-text-100 text-xs text-custom-text-200"
          >
            <span className="flex-grow truncate">{option.content}</span>
            {option.value === (value || "none") && <Check className="h-4 w-4 flex-shrink-0" />}
          </Combobox.Option>
        ))}
      </Combobox.Options>
    </Combobox>
  );
});
