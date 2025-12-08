import { observer } from "mobx-react";
import { CyclePreviewCard } from "../preview-cards/cycle";
import { ModulePreviewCard } from "../preview-cards/module";
import { PagePreviewCard } from "../preview-cards/page";
import { ProjectPreviewCard } from "../preview-cards/project";
import { ViewPreviewCard } from "../preview-cards/view";
import { WorkItemPreviewCard } from "../preview-cards/work-item";
import { AddRemovePreviewCard } from "./add-remove";
import { DeleteArchivePreviewCard } from "./delete-archieve";
import { TemplatePreviewCard } from "./template";

// --- Main PreviewCard Component ---
export const PreviewCard = observer(function PreviewCard(props: { artifactId: string; type: string; action: string }) {
  const { artifactId, type, action } = props;

  // Special cases
  if (["add", "remove"].includes(action)) return <AddRemovePreviewCard artifactId={artifactId} />;
  if (["delete", "archive"].includes(action)) return <DeleteArchivePreviewCard artifactId={artifactId} />;

  switch (type) {
    case "workitem":
      return <WorkItemPreviewCard artifactId={artifactId} />;
    case "epic":
      return <WorkItemPreviewCard artifactId={artifactId} isEpic />;
    case "page":
      return <PagePreviewCard artifactId={artifactId} />;
    case "cycle":
      return <CyclePreviewCard artifactId={artifactId} />;
    case "module":
      return <ModulePreviewCard artifactId={artifactId} />;
    case "view":
      return <ViewPreviewCard artifactId={artifactId} />;
    case "project":
      return <ProjectPreviewCard artifactId={artifactId} />;
    default:
      return <TemplatePreviewCard artifactId={artifactId} />;
  }
});
