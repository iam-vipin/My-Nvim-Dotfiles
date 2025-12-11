import { Check } from "lucide-react";
import { Combobox } from "@headlessui/react";
// plane imports
import { cn } from "@plane/utils";

export type TMovePageModalListItem = {
  logo: React.ReactNode;
  name: string;
  value: string;
};

type Props = {
  item: TMovePageModalListItem;
};

export function MovePageModalListItem(props: Props) {
  const { item } = props;

  return (
    <Combobox.Option
      key={item.value}
      value={item.value}
      className={({ active, selected }) =>
        cn(
          "flex items-center justify-between gap-2 truncate w-full cursor-pointer select-none rounded-md p-1 text-custom-text-200 transition-colors",
          {
            "bg-custom-background-80": active && !selected,
            "text-custom-text-100 bg-custom-primary-100/20": selected,
            "bg-custom-primary-100/30": selected && active,
          }
        )
      }
    >
      {({ selected }) => (
        <>
          <div className="flex items-center gap-2 truncate">
            <span
              className={cn("shrink-0 size-6 grid place-items-center rounded", {
                "bg-custom-background-80": !selected,
              })}
            >
              {item.logo}
            </span>
            <p className="text-sm truncate">{item.name}</p>
          </div>
          {selected && <Check className="shrink-0 size-4 text-custom-text-100" />}
        </>
      )}
    </Combobox.Option>
  );
}
