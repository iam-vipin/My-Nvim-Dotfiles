import useSWR from "swr";
// plane editor
import { CustomAIBlockUI } from "@plane/editor";
import type { TAIBlockNodeViewProps } from "@plane/editor";
import { useParams } from "next/navigation";
import { AIService } from "@/plane-web/services/ai.service";
const aiService = new AIService();

/**
 * AIBlockWidget - Web app component that fetches data and renders the AI block UI.
 * This component uses SWR to fetch blockTypes, revisionTypes, and blocks,
 * then passes them to the CustomAIBlockUI component from the editor package.
 */
export function AIBlockWidget(props: TAIBlockNodeViewProps) {
  const { pageId } = useParams<{ pageId: string }>();

  // Fetch block types
  const { data: blockTypesData } = useSWR("ai-block-types", async () => {
    const response = await aiService.getBlockTypes();
    return response?.types ?? [];
  });

  // Fetch revision types
  const { data: revisionTypesData } = useSWR("ai-block-revision-types", async () => {
    const response = await aiService.getRevisionTypes();
    return response?.types ?? [];
  });

  // Fetch blocks list
  const { data: blocksData } = useSWR(pageId ? `ai-block-list-${pageId}` : null, async () => {
    const response = await aiService.listBlocks(pageId);
    return response?.blocks ?? [];
  });

  return (
    <CustomAIBlockUI
      {...props}
      blockTypes={blockTypesData ?? []}
      revisionTypes={revisionTypesData ?? []}
      blocks={blocksData ?? []}
    />
  );
}
