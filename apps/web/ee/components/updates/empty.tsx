import { useTranslation } from "@plane/i18n";
import { EmptyStateCompact } from "@plane/propel/empty-state";

type TProps = {
  handleNewUpdate: () => void;
  allowNew: boolean;
};

export function EmptyUpdates(props: TProps) {
  const { handleNewUpdate, allowNew } = props;
  const { t } = useTranslation();

  return (
    <EmptyStateCompact
      assetKey="update"
      title={t("updates.empty.title")}
      description={t("updates.empty.description")}
      actions={[
        {
          label: t("updates.add_update"),
          onClick: () => handleNewUpdate(),
          variant: "primary",
          disabled: !allowNew,
        },
      ]}
      rootClassName="p-10"
    />
  );
}
