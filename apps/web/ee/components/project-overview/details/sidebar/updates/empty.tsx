import { EmptyStateCompact } from "@plane/propel/empty-state";

type TProps = {
  handleNewUpdate: () => void;
};

export const EmptyUpdates = (props: TProps) => {
  const { handleNewUpdate } = props;

  return (
    <EmptyStateCompact
      assetKey="update"
      title="No updates yet"
      description="You can see the updates here."
      actions={[
        {
          label: "Add an Update",
          onClick: () => handleNewUpdate(),
          variant: "primary",
        },
      ]}
      rootClassName="p-10"
    />
  );
};
