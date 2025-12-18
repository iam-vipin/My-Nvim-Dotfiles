import { isEmpty } from "lodash-es";
import { observer } from "mobx-react";
import { BriefcaseBusiness } from "lucide-react";
import { Logo } from "@plane/propel/emoji-icon-picker";
import { cn } from "@plane/propel/utils";
import type { TLogoProps } from "@plane/types";
import { useProject } from "@/hooks/store/use-project";

export const DisplayProject = observer(function DisplayProject(props: {
  project: { name: string; id: string; logo_props?: TLogoProps };
  className?: string;
}) {
  const { project, className } = props;
  const { getProjectById } = useProject();
  const projectDetails = getProjectById(project.id);
  const logoProps = project?.logo_props || projectDetails?.logo_props;
  return (
    <div className={cn("flex items-center gap-1 text-13 text-tertiary max-w-[100px] overflow-hidden", className)}>
      {!isEmpty(logoProps) ? (
        <Logo logo={logoProps} size={16} />
      ) : (
        <span className="grid h-4 w-4 flex-shrink-0 place-items-center">
          <BriefcaseBusiness className="h-4 w-4" />
        </span>
      )}
      <div className="truncate">{project?.name}</div>
    </div>
  );
});
