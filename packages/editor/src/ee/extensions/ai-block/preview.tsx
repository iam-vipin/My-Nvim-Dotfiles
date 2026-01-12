import { NodeViewContent } from "@tiptap/react";
import type { TAIBlockHandlers, TAIBlockRevisionType } from "@plane/types";

type CustomAIBlockPreviewProps = {
  hasContent: boolean;
  blockId: string | null;
  revisionTypes: TAIBlockRevisionType[];
  aiBlockHandlers: TAIBlockHandlers;
  backToSettings: () => void;
};
const CustomAIBlockPreview = (props: CustomAIBlockPreviewProps) => {
  const { hasContent } = props;

  return (
    <>
      {hasContent ? (
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <NodeViewContent
            placeholder="Describe the content of this block"
            as="div"
            className="w-full break-words prose prose-sm max-w-none"
          />
        </div>
      ) : (
        <div className="text-body-md-regular text-primary w-full text-start flex-1" contentEditable={false}>
          Your AI content will be generated here
        </div>
      )}
    </>
  );
};

export default CustomAIBlockPreview;
