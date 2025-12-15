import type { FC } from "react";
// types
import { Logo } from "@plane/propel/emoji-icon-picker";
import type { IProject } from "@plane/types";
// ui

export type ActiveCyclesProjectTitleProps = {
  project: Partial<IProject> | undefined;
};

export function ActiveCyclesProjectTitle(props: ActiveCyclesProjectTitleProps) {
  const { project } = props;
  return (
    <div className="flex items-center gap-2 px-3">
      {project?.logo_props && <Logo logo={project.logo_props} />}
      <h2 className="text-18 font-semibold">{project?.name}</h2>
    </div>
  );
}
