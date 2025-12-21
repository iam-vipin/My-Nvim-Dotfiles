import { AiSearchIcon, AiWriteIcon } from "@plane/propel/icons";
import { CustomSelect } from "@plane/ui";
import { Tooltip } from "@plane/propel/tooltip";
import { cn } from "@plane/utils";
import { ChevronDownIcon } from "lucide-react";

const MODE_OPTIONS = [
  {
    label: "Ask",
    value: "ask",
    icon: <AiSearchIcon className="size-4" />,
  },

  {
    label: "Build",
    value: "build",
    icon: <AiWriteIcon className="size-4" />,
  },
];
export function AiMode(props: { aiMode: string; setAiMode: (mode: string) => void }) {
  const { aiMode, setAiMode } = props;
  const selectedMode = MODE_OPTIONS.find((option) => option.value === aiMode);
  return (
    <CustomSelect
      value={aiMode}
      label={
        <Tooltip tooltipContent="Select the mode of the AI to use for the conversation." position="top">
          <div className="flex font-medium gap-1 w-full overflow-hidden ">
            <span className="flex items-center gap-2 text-icon-secondary">{selectedMode?.icon}</span>
            <span className="text-body-xs-medium truncate text-primary">{selectedMode?.label}</span>
            <ChevronDownIcon className="size-4 text-icon-secondary" />
          </div>
        </Tooltip>
      }
      noChevron
      onChange={(val: string) => {
        setAiMode(val);
      }}
      maxHeight="lg"
      className="flex flex-col-reverse"
      buttonClassName={cn(
        "rounded-lg h-full px-2 bg-layer-2 border border-subtle-1 rounded-lg h-[27px] overflow-hidden hover:bg-surface-1 hover:shadow-raised-100"
      )}
      optionsClassName="max-h-[70vh] overflow-y-auto"
    >
      <div className="flex flex-col divide-y divide-subtle space-y-2 max-h-full">
        <div>
          {MODE_OPTIONS.map((option) => (
            <CustomSelect.Option
              key={option.value}
              value={option.value}
              className="text-13 text-secondary font-medium flex w-full"
            >
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-2 text-tertiary">{option.icon}</span>
                <span className="text-13 truncate">{option.label}</span>
              </div>
            </CustomSelect.Option>
          ))}
        </div>
      </div>
    </CustomSelect>
  );
}
