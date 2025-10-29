import { useRouter } from "next/navigation";
import { EmptyStateCompact } from "@plane/propel/empty-state";
type TProps = {
  workspaceSlug: string;
  projectId: string;
};

export const UpgradeUpdates = (props: TProps) => {
  const { workspaceSlug, projectId } = props;
  const router = useRouter();
  return (
    <EmptyStateCompact
      assetKey="update"
      title="Updates"
      description="Feature is disabled, you can enable it in settings"
      actions={[
        {
          label: "Turn on Project Updates",
          onClick: () => {
            router.push(`/${workspaceSlug}/projects/${projectId}/settings/project-updates`);
          },
          variant: "primary",
        },
      ]}
      rootClassName="p-10"
    />
  );
};
