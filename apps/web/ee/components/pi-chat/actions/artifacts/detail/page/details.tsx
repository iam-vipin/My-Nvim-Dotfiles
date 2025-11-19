import { observer } from "mobx-react";
// plane imports
import type { TPage } from "@plane/types";
// local imports
import type { TArtifact, TUpdatedArtifact } from "@/plane-web/types";
import { usePageData } from "../../useArtifactData";
import { PageFormRoot } from "./root";

interface TPageDetailProps {
  data: TArtifact;
  isSaving: boolean;
  workspaceSlug: string;
  setIsSaving: (isSaving: boolean) => void;
  handleSuccess: () => void;
  handleError: (error: string) => void;
  updateArtifact: (data: TUpdatedArtifact) => Promise<void>;
}

export const PageDetail: React.FC<TPageDetailProps> = observer((props) => {
  const { data, workspaceSlug, handleError, updateArtifact } = props;
  // store hooks
  const updatedData = usePageData(data.artifact_id);

  // Helper: shallow/targeted equality for the page fields you care about.
  const isSameAsUpdatedData = (incoming: Partial<TPage> | null) => {
    if (!incoming) return true;
    // compare only known fields from your form
    const fields: (keyof Partial<TPage>)[] = ["description_html", "logo_props"];
    for (const f of fields) {
      const prev = JSON.stringify((updatedData as any)[f] ?? null);
      const next = JSON.stringify((incoming as any)[f] ?? null);
      if (prev !== next) return false;
    }
    return true;
  };

  const handleOnChange = async (formData: Partial<TPage> | null) => {
    if (!formData || isSameAsUpdatedData(formData)) return;
    try {
      await updateArtifact(formData as TUpdatedArtifact);
    } catch (err: any) {
      console.error(err);
      handleError(err?.message ?? String(err));
    }
  };

  return (
    <PageFormRoot
      workspaceSlug={workspaceSlug}
      artifactId={data.artifact_id}
      preloadedData={{
        description_html: updatedData.description_html,
        logo_props: updatedData.logo_props,
        name: updatedData.name,
      }}
      handleOnChange={handleOnChange}
    />
  );
});
