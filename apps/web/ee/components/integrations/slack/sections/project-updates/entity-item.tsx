import { Hash, Pencil, Trash2, ArrowRight } from "lucide-react";
import type { TSlackProjectUpdatesConfig } from "@plane/etl/slack";
import { Button } from "@plane/propel/button";
import { Logo } from "@plane/propel/emoji-icon-picker";
import { PlaneLogo } from "@plane/propel/icons";
import type { TWorkspaceEntityConnection } from "@plane/types";
import SlackLogo from "@/app/assets/services/slack.png?url";
import { useSlackIntegration } from "@/plane-web/hooks/store";

interface ConnectionItemProps {
  connection: TWorkspaceEntityConnection<TSlackProjectUpdatesConfig>;
  onEdit: (connection: TWorkspaceEntityConnection<TSlackProjectUpdatesConfig>) => void;
  onDelete: (connection: TWorkspaceEntityConnection<TSlackProjectUpdatesConfig>) => void;
}

export function ConnectionItem({ connection, onEdit, onDelete }: ConnectionItemProps) {
  const { getProjectById } = useSlackIntegration();

  if (!connection.project_id || !connection.entity_slug) return null;

  const project = getProjectById(connection.project_id);

  return (
    <div
      className={`
      group relative bg-surface-1 border border-subtle
      rounded-lg overflow-hidden hover:shadow-sm transition-all duration-200
    `}
    >
      {/* Status indicator strip */}
      <div
        className={`
        absolute top-0 left-0 h-full w-1 bg-accent-primary/30
        group-hover:bg-accent-primary transition-colors duration-300
      `}
      />

      <div className="p-4 pl-5 relative flex items-center">
        {/* Fixed-size wrapper for both main content and actions */}
        <div className="w-full flex">
          {/* Content container with reserve space for actions */}
          <div
            className={`
            flex-1 flex items-center transition-all duration-300 ease-in-out
            pr-0 group-hover:pr-[70px]
          `}
          >
            {/* Project Side */}
            <div className="flex-1 min-w-0 pr-1">
              <div
                className={`
                flex items-center gap-2 bg-layer-1 py-2 px-3
                rounded-lg border border-subtle shadow-sm
                transition-all duration-200 group-hover:border-subtle
              `}
              >
                {/* Plane Logo */}
                <PlaneLogo className="h-5 w-auto shrink-0 text-accent-primary" />

                {/* Project Info with Logo */}
                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                  {/* Project Logo */}
                  <div
                    className={`
                    h-4 w-4 shrink-0 bg-surface-1 rounded
                    overflow-hidden flex items-center justify-center
                  `}
                  >
                    {project?.logo_props ? (
                      <Logo logo={project?.logo_props} size={12} />
                    ) : (
                      <div
                        className={`
                        h-full w-full flex items-center justify-center
                        text-primary font-medium bg-accent-primary/10
                        rounded-sm                         text-caption-xs
                      `}
                      >
                        {project?.name?.charAt(0).toUpperCase() || "P"}
                      </div>
                    )}
                  </div>

                  {/* Project Name */}
                  <span className="text-body-xs-medium text-primary truncate">{project?.name || "Project"}</span>
                </div>
              </div>
            </div>

            {/* Arrow - with reduced margins */}
            <div className="mx-2 shrink-0">
              <div
                className={`
                w-8 h-8 rounded-full flex items-center justify-center
                bg-gradient-to-r from-layer-1 to-surface-2
                border border-subtle shadow-raised-100 transition-all duration-200
                group-hover:shadow group-hover:border-accent-strong/30
              `}
              >
                <ArrowRight
                  className={`
                  h-4 w-4 text-tertiary
                  group-hover:text-accent-primary transition-colors duration-300
                `}
                />
              </div>
            </div>

            {/* Slack Channel */}
            <div className="flex-1 min-w-0 pl-1">
              <div
                className={`
                flex items-center gap-2 bg-layer-1 py-2 px-3
                rounded-lg border border-subtle shadow-sm
                transition-all duration-200 group-hover:border-subtle
              `}
              >
                {/* Slack Logo */}
                <div className="h-5 w-5 shrink-0 relative">
                  <img src={SlackLogo} alt="Slack" className="w-full h-full object-cover" />
                </div>

                {/* Channel Info */}
                <div className="flex items-center gap-1 flex-1 min-w-0">
                  <Hash className="h-3.5 w-3.5 text-[#E01E5A] shrink-0" />
                  <span className="text-body-xs-medium text-primary truncate">{connection.entity_slug}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions - positioned absolutely */}
          <div
            className={`
            absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1
            opacity-0 invisible transition-all duration-300 ease-in-out
            group-hover:opacity-100 group-hover:visible
          `}
          >
            <Button
              variant="secondary"
              className={`
                h-7 w-7 rounded-md p-0
                hover:bg-accent-primary/10 hover:text-accent-primary
                transition-colors
              `}
              onClick={() => onEdit(connection)}
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="secondary"
              className={`
                h-7 w-7 rounded-md p-0
                hover:bg-danger-subtle hover:text-danger-primary
                transition-colors
              `}
              onClick={() => onDelete(connection)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
