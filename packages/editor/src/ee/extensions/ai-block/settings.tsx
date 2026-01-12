import type { TAIBlockDetails, TAIBlockHandlers, TAIBlockType } from "@plane/types";
import { CustomSelect, TextArea } from "@plane/ui";
import { PiIcon } from "@plane/propel/icons";
import { useMemo } from "react";
import { NodeViewContent } from "@tiptap/react";

type CustomAIBlockSettingsProps = {
  blockTypes: TAIBlockType[];
  aiBlockHandlers: TAIBlockHandlers;
  isEmpty: boolean;
  blockId: string | null;
  block: Partial<TAIBlockDetails> | undefined;
  setBlock: (block: Partial<TAIBlockDetails>) => void;
};
export function CustomAIBlockSettings(props: CustomAIBlockSettingsProps) {
  const { blockTypes, isEmpty, setBlock, block } = props;
  // derived values
  const selectedBlockType = useMemo(
    () => block && blockTypes?.find((type) => type.key === block?.block_type),
    [blockTypes, block]
  );
  return (
    <>
      <div className="flex flex-col gap-4 p-3">
        <div contentEditable={false}>
          <CustomSelect
            value={block?.block_type ?? ""}
            onChange={(value: string) => setBlock({ ...(block ?? {}), block_type: value })}
            label={
              <div className="flex items-center gap-2">
                <PiIcon className="size-5 text-icon-secondary" />
                <span className="text-body-sm-medium text-primary">
                  {selectedBlockType?.label ?? "Select block type"}
                </span>
              </div>
            }
            className="w-fit"
            buttonClassName="w-fit px-1 rounded-md"
          >
            {blockTypes.map((type) => (
              <CustomSelect.Option key={type.key} value={type.key}>
                {type.label}
              </CustomSelect.Option>
            ))}
          </CustomSelect>
        </div>

        <div className="rounded-lg min-h-[80px] w-full transition-all duration-300">
          <div className="flex flex-col gap-4">
            {selectedBlockType?.has_content ? (
              <div className="flex flex-col gap-2">
                <div className="text-body-sm-medium text-primary">Prompt</div>
                <TextArea
                  value={block?.content ?? ""}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setBlock({ ...(block ?? {}), content: e.target.value })
                  }
                  placeholder="Describe the content of this block"
                  className="w-full border border-strong bg-layer-2 rounded-lg shadow-none py-2 px-3 text-body-sm-regular"
                  onKeyDown={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={(e) => e.stopPropagation()}
                  onFocus={(e) => e.stopPropagation()}
                />
              </div>
            ) : (
              isEmpty && (
                <div
                  className="h-full w-full flex items-start justify-start bg-layer-2 rounded-lg"
                  contentEditable={false}
                >
                  <div className="text-body-md-regular text-primary">{selectedBlockType?.description}</div>
                </div>
              )
            )}
            {!isEmpty && (
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <NodeViewContent
                  placeholder="Describe the content of this block"
                  as="div"
                  className="w-full break-words prose prose-sm max-w-none"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
