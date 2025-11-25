import type { FC } from "react";
// types
import { Logo } from "@plane/propel/emoji-icon-picker";
import type { IProject } from "@plane/types";
// ui

export type ActiveCyclesProjectTitleProps = {
  project: Partial<IProject> | undefined;
};

export const ActiveCyclesProjectTitle: FC<ActiveCyclesProjectTitleProps> = (props) => {
  const { project } = props;
  return (
    <div className="flex items-center gap-2 px-3">
      {project?.logo_props && <Logo logo={project.logo_props} />}
      <h2 className="text-xl font-semibold">{project?.name}</h2>
    </div>
  );
};
