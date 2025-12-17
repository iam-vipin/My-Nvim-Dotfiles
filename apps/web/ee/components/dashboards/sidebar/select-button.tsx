// plane imports
import { cn } from "@plane/utils";

type Props = {
  placeholder: string;
  title: string;
  value: boolean;
};

export function WidgetConfigSelectButton(props: Props) {
  const { placeholder, title, value } = props;

  return (
    <div
      className={cn("w-full px-2 py-1 rounded-sm hover:bg-layer-1 text-left cursor-pointer transition-colors", {
        "text-placeholder": !value,
      })}
    >
      {value ? title : placeholder}
    </div>
  );
}
