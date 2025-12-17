type TFormCardProps = {
  title: string;
  children: React.ReactNode;
  infoComponent?: React.ReactNode;
};

export function FormCard(props: TFormCardProps) {
  const { title, children, infoComponent } = props;

  return (
    <div className="space-y-1">
      <h4 className="text-13 font-semibold text-placeholder">{title}</h4>
      <div className="flex flex-col w-full gap-3 border border-subtle-1 rounded-md bg-layer-1/70 px-4 py-3">
        {children}
      </div>
      {infoComponent}
    </div>
  );
}
