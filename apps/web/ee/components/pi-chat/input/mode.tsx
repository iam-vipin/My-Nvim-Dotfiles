import { AiSearchIcon, AiWriteIcon } from "@plane/propel/icons";
import { CustomSelect, Tooltip } from "@plane/ui";
import { cn } from "@plane/utils";

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
          <div className="flex font-medium gap-2 w-full overflow-hidden">
            <span className="flex items-center gap-2 text-custom-text-300">{selectedMode?.icon}</span>
            <span className="text-sm truncate">{selectedMode?.label}</span>
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
        "rounded-lg h-full px-2 border-[0.5px] border-custom-border-200 h-[27px] overflow-hidden hover:bg-custom-background-100"
      )}
      optionsClassName="max-h-[70vh] overflow-y-auto"
    >
      <div className="flex flex-col divide-y divide-custom-border-100 space-y-2 max-h-full">
        <div>
          {MODE_OPTIONS.map((option) => (
            <CustomSelect.Option
              key={option.value}
              value={option.value}
              className="text-sm text-custom-text-200 font-medium flex w-full"
            >
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-2 text-custom-text-300">{option.icon}</span>
                <span className="text-sm truncate">{option.label}</span>
              </div>
            </CustomSelect.Option>
          ))}
        </div>
      </div>
    </CustomSelect>
  );
}
