type TModalFormHeader = {
  title: string;
  description: string;
};

export function ModalFormHeader({ title, description }: TModalFormHeader) {
  return (
    <div className="flex flex-col gap-1.5">
      <h5 className="text-h5-medium text-primary">{title}</h5>
      <p className="text-body-xs-regular text-secondary">{description}</p>
    </div>
  );
}
