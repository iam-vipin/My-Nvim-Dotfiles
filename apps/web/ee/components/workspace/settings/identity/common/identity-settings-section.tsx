type TIdentitySettingsSectionProps = {
  sectionTitle: string;
  children?: React.ReactNode;
  showBorder?: boolean;
};

export function IdentitySettingsSection(props: TIdentitySettingsSectionProps) {
  const { sectionTitle, children } = props;

  return (
    <div className={"w-full flex flex-col gap-8 bg-layer-transparent"}>
      {/* Section title */}
      <h5 className="text-h5-medium text-primary">{sectionTitle}</h5>
      {/* Section content */}
      {children}
    </div>
  );
}
